// Class games: pick the exercise you taught today and finish the lesson with a quick team game on the board.
import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, BookOpen, Layers, Play, Presentation } from 'lucide-react'
import { GameResume } from '@/components/numbat/GameResume'
import { PageLoading, Shell } from '@/components/numbat/Shell'
import { findSkill } from '@/content'
import { GAME_BOOKS } from '@/content/games'
import type { GameBook, GameChapter } from '@/lib/game/types'
import { pageHead } from '@/lib/meta'
import { load, save } from '@/lib/storage'
import { useMounted } from '@/lib/use-mounted'

export const Route = createFileRoute('/games')({
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
  const [bookId, setBookId] = useState(() => {
    const last = load('numbat.gameBook')
    return GAME_BOOKS.some((b) => b.id === last) ? (last as string) : GAME_BOOKS[0].id
  })
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
        {book.chapters.map((c) => (
          <Chapter key={c.id} book={book} chapter={c} />
        ))}
        <p className="text-sm text-muted-foreground">More chapters and Years 8 to 10 are on the way.</p>
      </section>
    </div>
  )
}

function Chapter({ book, chapter }: { book: GameBook; chapter: GameChapter }) {
  return (
    <section className="grid gap-3" style={{ ['--hue' as string]: chapter.colour }} aria-labelledby={chapter.id}>
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
          <Link to="/game" search={{ id: chapter.id }} className="btn btn-soft">
            <Layers size={18} aria-hidden="true" /> Whole chapter mix
          </Link>
        </div>
      </header>

      <ol className="grid gap-2">
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
