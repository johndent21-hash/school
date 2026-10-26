import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, ClipboardCheck } from 'lucide-react'
import { NotFoundPanel, PageLoading, Shell } from '@/components/numbat/Shell'
import { TestRunner } from '@/components/numbat/TestRunner'
import { findTopic } from '@/content'
import { pageHead } from '@/lib/meta'
import { testItemId } from '@/lib/practice'
import { useProgress } from '@/lib/progress'
import { useSession } from '@/lib/session'
import { useMounted } from '@/lib/use-mounted'

export const Route = createFileRoute('/test')({
  validateSearch: (s: Record<string, unknown>): { id?: string } => ({ id: typeof s.id === 'string' ? s.id : undefined }),
  head: () => pageHead('/test'),
  component: TestPage,
})

function TestPage() {
  const mounted = useMounted()
  const { ready } = useSession()
  return <Shell>{mounted && ready ? <TestView /> : <PageLoading />}</Shell>
}

function TestView() {
  const { id } = Route.useSearch()
  const topic = id ? findTopic(id) : undefined
  const { items } = useProgress()
  const { teacher } = useSession()
  const [run, setRun] = useState(0)
  if (!topic) return <NotFoundPanel what="topic" />
  const p = items[testItemId(topic.id)]

  if (run > 0) {
    return (
      <div className="mx-auto grid max-w-4xl gap-4" style={{ ['--hue' as string]: topic.colour }}>
        <h1 className="font-display text-2xl font-semibold">{topic.title}: topic test</h1>
        <TestRunner key={run} topic={topic} onExit={() => setRun(0)} onAgain={() => setRun(run + 1)} />
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-2xl gap-5">
      <Link to="/topic" search={{ id: topic.id }} className="btn btn-ghost btn-sm w-fit">
        <ArrowLeft size={16} aria-hidden="true" /> {topic.title}
      </Link>
      <section className="q-card grid gap-4">
        <ClipboardCheck size={36} className="text-primary" aria-hidden="true" />
        <h1 className="font-display text-3xl font-semibold">{topic.title}: topic test</h1>
        <ul className="grid list-disc gap-1 pl-5 text-muted-foreground">
          <li>10 questions from across the topic, from Foundation to Challenge.</li>
          <li>One try at each question. You won’t see if you’re right until the end.</li>
          <li>You can go back and change answers before you finish.</li>
          <li>Have some paper ready for working. Some questions say a calculator is allowed.</li>
        </ul>
        {p && (
          <p className="font-bold">
            Your best: {p.best}% ({p.attempts} attempt{p.attempts === 1 ? '' : 's'})
          </p>
        )}
        {teacher && <p className="feedback info text-sm">Teacher preview: results are not saved.</p>}
        <button type="button" className="btn btn-primary btn-lg w-fit" onClick={() => setRun(1)}>
          Start the test
        </button>
      </section>
    </div>
  )
}
