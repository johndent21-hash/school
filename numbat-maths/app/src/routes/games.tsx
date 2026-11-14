// Class games: pick the exercise you taught today and finish the lesson with a quick team game on the board.
import { useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, BookOpen, ChevronDown, History, Layers, Play, Presentation, Printer } from 'lucide-react'
import { GameResume } from '@/components/numbat/GameResume'
import { PageLoading, Shell } from '@/components/numbat/Shell'
import { findSkill } from '@/content'
import { GAME_BOOKS } from '@/content/games'
import type { GameBook, GameChapter } from '@/lib/game/types'
import { pageHead } from '@/lib/meta'
import { load, save } from '@/lib/storage'
import { useMounted } from '@/lib/use-mounted'

export const Route = createFileRoute('/games')({
  // ?chapter=ncm7-ch4 opens that chapter and scrolls to it (links from a topic page, and back from a game)
  validateSearch: (s: Record<string, unknown>): { chapter?: string } => ({ chapter: typeof s.chapter === 'string' ? s.chapter : undefined }),
  head: () => pageHead('/games'),
  component: GamesPage,
})

function GamesPage() {
  const mounted = useMounted()
  return <Shell>{mounted ? <Games /> : <PageLoading />}</Shell>
}

const STEPS = [
  { title: 'Pick the exercise', text: 'Choose the textbook exercise you taught today. Every question practises that exercise’s core skill.' },
  { title: 'Teams answer', text: 'Each question goes up on the board. Every team works it out and holds up A, B, C or D.' },
  { title: 'Dig for termites', text: 'Tick the teams that were right. Each one digs up a log: mostly termites, sometimes a surprise.' },
]

function Games() {
  const { chapter: asked } = Route.useSearch()
  const askedBook = asked ? GAME_BOOKS.find((b) => b.chapters.some((c) => c.id === asked)) : undefined
  const [bookId, setBookId] = useState(() => {
    if (askedBook) return askedBook.id
    const last = load('numbat.gameBook')
    return GAME_BOOKS.some((b) => b.id === last) ? (last as string) : GAME_BOOKS[0].id
  })
  // which chapters show their exercises: the one asked for, else the ones left open on this device
  const [open, setOpen] = useState<string[]>(() => {
    const kept = load('numbat.gameChapters')
    const list = Array.isArray(kept) ? kept.filter((x): x is string => typeof x === 'string') : []
    return asked && !list.includes(asked) ? [...list, asked] : list
  })
  const toggle = (id: string, show: boolean) => {
    const next = show ? [...open.filter((x) => x !== id), id] : open.filter((x) => x !== id)
    setOpen(next)
    save('numbat.gameChapters', next)
  }
  useEffect(() => {
    if (asked) document.getElementById(`${asked}-head`)?.scrollIntoView({ block: 'start' })
  }, [asked])
  const book = GAME_BOOKS.find((b) => b.id === bookId) ?? GAME_BOOKS[0]
  const pick = (id: string) => {
    setBookId(id)
    save('numbat.gameBook', id)
  }

  return (
    <div className="grid gap-8">
      <Link to="/" className="btn btn-ghost btn-sm w-fit">
        <ArrowLeft size={16} aria-hidden="true" /> Home
      </Link>

      <section className="grid gap-4">
        <div className="grid gap-2">
          <span className="chip w-fit">
            <Presentation size={13} aria-hidden="true" /> For the whole class, on the board
          </span>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Class games</h1>
          <p className="max-w-3xl text-lg text-muted-foreground">
            Finish the lesson with a five-minute team game on the exercise you just taught. Quick questions done in the head, four choices each, no student devices
            needed.
          </p>
        </div>
        <ol className="grid gap-3 sm:grid-cols-3">
          {STEPS.map((s, k) => (
            <li key={s.title} className="panel grid content-start gap-1 p-4">
              <span className="tile-mark grid size-9 place-items-center rounded-lg bg-primary-soft font-bold text-primary">{k + 1}</span>
              <h2 className="font-display text-lg font-semibold">{s.title}</h2>
              <p className="text-sm text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <GameResume />

      <section className="grid gap-4" aria-labelledby="books">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="books" className="font-display text-2xl font-semibold">
            {book.title}
          </h2>
          {GAME_BOOKS.length > 1 && (
            <div className="tabs" role="tablist" aria-label="Textbook">
              {GAME_BOOKS.map((b) => (
                <button key={b.id} type="button" role="tab" aria-selected={b.id === book.id} className={b.id === book.id ? 'active' : ''} onClick={() => pick(b.id)}>
                  {b.short}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Year {book.year} · {book.stage}. The questions are Numbat Maths’ own, written to match each exercise; none are copied from the textbook.
        </p>
        <RevisionMix key={book.id} book={book} />
        {book.chapters.map((c) => (
          <Chapter key={c.id} book={book} chapter={c} open={open.includes(c.id)} onToggle={(show) => toggle(c.id, show)} />
        ))}
        <p className="text-sm text-muted-foreground">More chapters, and Years 9 and 10, are on the way.</p>
      </section>
    </div>
  )
}

function RevisionMix({ book }: { book: GameBook }) {
  const [upTo, setUpTo] = useState(book.chapters.length)
  return (
    <section className="panel grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center" aria-labelledby={`${book.id}-rev`}>
      <div className="grid gap-1">
        <h3 id={`${book.id}-rev`} className="font-display flex items-center gap-2 text-xl font-semibold">
          <History size={20} aria-hidden="true" /> Year revision mix
        </h3>
        <p className="text-sm text-muted-foreground">
          Questions from every chapter studied so far, with older chapters coming up more often. Good before the yearly exam.
        </p>
        <label className="flex flex-wrap items-center gap-2 text-sm">
          Chapters 1 to
          <select className="field w-auto py-1" value={upTo} onChange={(e) => setUpTo(Number(e.target.value))}>
            {book.chapters.slice(1).map((c) => (
              <option key={c.number} value={c.number}>
                {c.number}: {c.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to="/worksheet" className="btn btn-ghost">
          <Printer size={18} aria-hidden="true" /> Worksheets and tests
        </Link>
        <Link to="/game" search={{ id: `${book.id}-rev${upTo}` }} className="btn btn-primary" aria-label={`Play the ${book.short} year revision mix, chapters 1 to ${upTo}`}>
          <Play size={18} aria-hidden="true" /> Play
        </Link>
      </div>
    </section>
  )
}

function Chapter({ book, chapter, open, onToggle }: { book: GameBook; chapter: GameChapter; open: boolean; onToggle: (show: boolean) => void }) {
  const listId = `${chapter.id}-sets`
  return (
    <section className="grid scroll-mt-4 gap-3" style={{ ['--hue' as string]: chapter.colour }} aria-labelledby={chapter.id} id={`${chapter.id}-head`}>
      <header className="topic-tile cursor-default hover:transform-none">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip chip-book">{chapter.ref}</span>
          <span className="chip">{chapter.strand}</span>
          {chapter.outcomes.map((o) => (
            <span key={o} className="chip chip-code" title="NSW syllabus outcome">
              {o}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id={chapter.id} className="font-display text-2xl font-semibold">
            Chapter {chapter.number}: {chapter.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id={`${chapter.id}-toggle`}
              className="btn btn-ghost"
              aria-expanded={open}
              aria-controls={listId}
              onClick={() => onToggle(!open)}
            >
              <ChevronDown size={18} aria-hidden="true" className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
              {open ? 'Hide the exercises' : `Show the ${chapter.sets.length} exercises`}
            </button>
            <Link to="/game" search={{ id: chapter.id }} className="btn btn-soft">
              <Layers size={18} aria-hidden="true" /> Whole chapter mix
            </Link>
          </div>
        </div>
      </header>

      <ol className="grid gap-2" id={listId} hidden={!open}>
        {chapter.sets.map((s) => {
          const lessons = (s.lessons ?? []).map((id) => findSkill(id)).filter((x) => x !== undefined)
          return (
            <li key={s.id} className="panel grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="grid gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-lg font-semibold">
                    {s.exercise} {s.title}
                  </span>
                  {s.outcomes.map((o) => (
                    <span key={o} className="chip chip-code" title="NSW syllabus outcome">
                      {o}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{s.focus}</p>
                {lessons.length > 0 && (
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <BookOpen size={14} aria-hidden="true" /> Lesson and practice:
                    </span>
                    {lessons.map((l) => (
                      <Link key={l.skill.id} to="/lesson" search={{ id: l.skill.id, tab: 'learn' }} className="font-bold text-primary underline-offset-4 hover:underline">
                        {l.skill.title}
                      </Link>
                    ))}
                  </p>
                )}
              </div>
              <Link to="/game" search={{ id: s.id }} className="btn btn-primary" aria-label={`Play ${book.short} Exercise ${s.exercise}: ${s.title}`}>
                <Play size={18} aria-hidden="true" /> Play
              </Link>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
