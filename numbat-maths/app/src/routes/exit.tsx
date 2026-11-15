// A student's exit ticket: a few quick questions at the end of the lesson, handed in once. The teacher sees the
// class's answers on the class page (Exit tickets).
import { useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, Info, XCircle } from 'lucide-react'
import { Diagram, MathHtml } from '@/components/numbat/MathHtml'
import { PageLoading, Shell } from '@/components/numbat/Shell'
import { ticketItems } from '@/lib/game/exit'
import type { GameItem } from '@/lib/game/types'
import { useMyExitTicket, useSubmitExit, type MyTicket } from '@/lib/exit-data'
import { pageHead } from '@/lib/meta'
import { PREVIEW_ONLY } from '@/lib/preview'
import { useSession } from '@/lib/session'
import { useMounted } from '@/lib/use-mounted'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/exit')({
  head: () => pageHead('/exit'),
  component: ExitPage,
})

const LETTERS = ['A', 'B', 'C', 'D']

function ExitPage() {
  const mounted = useMounted()
  const { ready } = useSession()
  return <Shell>{mounted && (ready || PREVIEW_ONLY) ? <ExitView /> : <PageLoading />}</Shell>
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-xl gap-4">
      <h1 className="flex items-center gap-2 font-display text-3xl font-semibold">
        <ClipboardCheck size={30} className="text-primary" aria-hidden="true" /> Exit ticket
      </h1>
      <div className="panel grid gap-3 p-5">{children}</div>
    </div>
  )
}

function ExitView() {
  const { student, teacher } = useSession()
  const my = useMyExitTicket()
  if (!PREVIEW_ONLY && teacher)
    return (
      <Note>
        <p>Students answer exit tickets on their own devices. Start one from your class page, under Exit tickets.</p>
        <Link to="/teacher" className="btn btn-primary w-fit">
          My classes
        </Link>
      </Note>
    )
  if (!PREVIEW_ONLY && !student)
    return (
      <Note>
        <p>Log in to answer your teacher’s exit ticket.</p>
        <Link to="/join" className="btn btn-primary w-fit">
          Log in
        </Link>
      </Note>
    )
  if (my === undefined) return <PageLoading />
  if (!my.ok) return <Note><p className="feedback bad">{my.message}</p></Note>
  if (!my.ticket)
    return (
      <Note>
        <p>There’s no exit ticket open for your class right now. Your teacher starts one at the end of a lesson.</p>
        <Link to="/home" className="btn btn-ghost w-fit">
          <ArrowLeft size={16} aria-hidden="true" /> Home
        </Link>
      </Note>
    )
  return <Ticket key={my.ticket.id} ticket={my.ticket} done={my.done} example={!!my.example} />
}

function Ticket({ ticket, done, example }: { ticket: MyTicket; done: { choices: number[]; correct: number; total: number } | null; example: boolean }) {
  const items = useMemo(() => ticketItems(ticket), [ticket])
  const submit = useSubmitExit()
  const [choices, setChoices] = useState<number[]>(() => Array(ticket.count).fill(-1))
  const [i, setI] = useState(0)
  const [result, setResult] = useState<{ choices: number[]; correct: number; total: number } | null>(done)
  const [checking, setChecking] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!items)
    return (
      <Note>
        <p>This exit ticket was made before the site was updated, so it can’t be shown. Tell your teacher, who can start a new one.</p>
      </Note>
    )

  const banner = example && (
    <p className="feedback info flex items-start gap-2 text-sm">
      <Info size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>Example exit ticket from the made-up class. On the full site students answer it on their own devices and the teacher sees the results; here nothing is saved.</span>
    </p>
  )

  if (result) return <Results ticket={ticket} items={items} result={result} banner={banner} />

  const it = items[i]
  const left = choices.filter((c) => c < 0).length
  const handIn = async () => {
    setBusy(true)
    setError(null)
    const r = await submit(ticket.id, choices)
    setBusy(false)
    if (r.ok) {
      setResult({ choices, correct: r.correct, total: r.total })
      window.scrollTo({ top: 0 })
    }
    else setError(r.message)
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      {banner}
      <header className="grid gap-1">
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold sm:text-3xl">
          <ClipboardCheck size={28} className="text-primary" aria-hidden="true" /> Exit ticket
        </h1>
        <p className="text-muted-foreground">{ticket.title}</p>
      </header>
      <nav className="flex flex-wrap gap-2" aria-label="Questions">
        {items.map((_, k) => (
          <button
            key={k}
            type="button"
            className={cn('btn btn-sm min-w-10', k === i ? 'btn-primary' : 'btn-ghost', choices[k] >= 0 && k !== i && 'font-bold')}
            aria-current={k === i ? 'step' : undefined}
            aria-label={`Question ${k + 1}${choices[k] >= 0 ? ', answered' : ''}`}
            onClick={() => {
              setI(k)
              setChecking(false)
            }}
          >
            {choices[k] >= 0 ? '✓' : k + 1}
          </button>
        ))}
      </nav>
      <section className="q-card grid gap-4" aria-label={`Question ${i + 1} of ${items.length}`}>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="font-bold">
            Question {i + 1} of {items.length}
          </span>
          {it.calc && <span className="chip">Calculator allowed</span>}
        </div>
        <MathHtml html={it.q.prompt} className="text-lg" />
        <Diagram svg={it.q.diagram} note={it.q.note} />
        <div className="mc-options cols-2" role="radiogroup" aria-label="Choose an answer">
          {it.q.options.map((o, k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={choices[i] === k}
              className={cn('mc-option', choices[i] === k && 'selected')}
              onClick={() => setChoices(choices.map((c, j) => (j === i ? k : c)))}
            >
              <span className="letter">{LETTERS[k]}</span>
              <MathHtml inline html={o} />
            </button>
          ))}
        </div>
      </section>
      {checking ? (
        <div className="feedback info grid gap-3" role="alert">
          <span>
            {left > 0 ? `You’ve left ${left} ${left === 1 ? 'question' : 'questions'} out. ` : ''}You can only hand it in once.
          </span>
          <span className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => void handIn()} disabled={busy}>
              Hand it in
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setChecking(false)}>
              Go back
            </button>
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" className="btn btn-ghost" onClick={() => setI(i - 1)} disabled={i === 0}>
            <ArrowLeft size={18} aria-hidden="true" /> Back
          </button>
          {i < items.length - 1 ? (
            <button type="button" className="btn btn-primary" onClick={() => setI(i + 1)}>
              Next <ArrowRight size={18} aria-hidden="true" />
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setChecking(true)}>
              Hand in
            </button>
          )}
        </div>
      )}
      {error && <p className="feedback bad">{error}</p>}
    </div>
  )
}

function Results({ ticket, items, result, banner }: { ticket: MyTicket; items: GameItem[]; result: { choices: number[]; correct: number; total: number }; banner: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      {banner}
      <header className="q-card grid gap-2">
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold sm:text-3xl">
          <ClipboardCheck size={28} className="text-primary" aria-hidden="true" /> Handed in
        </h1>
        <p className="text-muted-foreground">{ticket.title}</p>
        <p className="font-display text-3xl font-semibold">
          {result.correct} out of {result.total}
        </p>
        <p className="text-sm text-muted-foreground">Your teacher can see your answers. Look over any you got wrong below.</p>
      </header>
      <ol className="grid gap-3">
        {items.map((it, k) => {
          const c = result.choices[k]
          const right = c === it.q.correct
          return (
            <li key={k} className="panel grid gap-2 p-4">
              <p className="flex items-center gap-2 font-bold">
                {right ? <CheckCircle2 size={18} className="text-[hsl(var(--success))]" aria-hidden="true" /> : <XCircle size={18} className="text-[hsl(var(--accent-2))]" aria-hidden="true" />}
                Question {k + 1}: {right ? 'right' : c < 0 ? 'left out' : 'not right'}
              </p>
              <MathHtml html={it.q.prompt} />
              <Diagram svg={it.q.diagram} note={it.q.note} />
              {!right && c >= 0 && (
                <p>
                  Your answer: {LETTERS[c]} <MathHtml inline html={it.q.options[c]} />
                </p>
              )}
              <p>
                <strong>Answer:</strong> {LETTERS[it.q.correct]} <MathHtml inline html={it.q.options[it.q.correct]} />
              </p>
              <p className="text-sm text-muted-foreground">
                <MathHtml inline html={it.q.why} />
              </p>
            </li>
          )
        })}
      </ol>
      <Link to="/home" className="btn btn-ghost w-fit">
        <ArrowLeft size={16} aria-hidden="true" /> Home
      </Link>
    </div>
  )
}
