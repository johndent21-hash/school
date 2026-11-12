// One class game: choose the teams and the length, then play it on the board.
import { useMemo, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Minus, Play, Plus, RotateCcw, Shuffle } from 'lucide-react'
import { GameBoard } from '@/components/numbat/GameBoard'
import { Diagram, MathHtml } from '@/components/numbat/MathHtml'
import { NotFoundPanel, PageLoading, Shell } from '@/components/numbat/Shell'
import { findGame, gameTitle, type FoundGame } from '@/content/games'
import {
  type BoardState, clearBoard, gameItems, loadBoard, loadSettings, MAX_TEAMS, MIN_TEAMS, newBoard, saveSettings, TEAM_NAMES, TIMER_CHOICES,
} from '@/lib/board'
import { GAME_LENGTHS } from '@/lib/game/build'
import { pageHead } from '@/lib/meta'
import { newSeed } from '@/lib/practice'
import { cn } from '@/lib/utils'
import { useMounted } from '@/lib/use-mounted'

export const Route = createFileRoute('/game')({
  // go: carry straight on with the game that was left unfinished (from the "game in progress" banner)
  validateSearch: (s: Record<string, unknown>): { id?: string; go?: 1 } => ({ id: typeof s.id === 'string' ? s.id : undefined, go: s.go === 1 || s.go === '1' ? 1 : undefined }),
  head: () => pageHead('/game'),
  component: GamePage,
})

function GamePage() {
  const mounted = useMounted()
  const { id, go } = Route.useSearch()
  const found = id ? findGame(id) : undefined
  return <Shell>{!mounted ? <PageLoading /> : found ? <Game key={id} found={found} id={id!} carryOn={go === 1} /> : <NotFoundPanel what="game" />}</Shell>
}

const LETTERS = ['A', 'B', 'C', 'D']

function Game({ found, id, carryOn }: { found: FoundGame; id: string; carryOn: boolean }) {
  const navigate = useNavigate()
  const title = gameTitle(found)
  // a game for this exercise that was left unfinished on this device
  const [saved, setSaved] = useState<BoardState | null>(() => {
    const b = loadBoard()
    return b && b.cfg.game === id ? b : null
  })
  const [board, setBoard] = useState<BoardState | null>(() => (carryOn ? saved : null))
  const [run, setRun] = useState(0)
  const items = useMemo(() => (board ? gameItems(board.cfg) : null), [board])

  const start = (cfg: { teams: string[]; count: number; secs: number; seed: number }) => {
    saveSettings({ teams: cfg.teams, count: cfg.count, secs: cfg.secs })
    const full = { game: id, ...cfg }
    const its = gameItems(full)
    if (!its) return
    setSaved(null)
    setBoard(newBoard(full, its))
    setRun((r) => r + 1)
  }

  if (board && items)
    return (
      <GameBoard
        key={run}
        items={items}
        initial={board}
        title={title}
        onExit={() => void navigate({ to: '/games' })}
        onAgain={() => start({ teams: board.cfg.teams, count: board.cfg.count, secs: board.cfg.secs, seed: newSeed() })}
      />
    )

  return (
    <Setup
      found={found}
      id={id}
      title={title}
      saved={saved}
      onResume={() => {
        setBoard(saved)
        setRun((r) => r + 1)
      }}
      onDiscard={() => {
        clearBoard()
        setSaved(null)
      }}
      onStart={start}
    />
  )
}

function Setup({
  found,
  id,
  title,
  saved,
  onResume,
  onDiscard,
  onStart,
}: {
  found: FoundGame
  id: string
  title: string
  saved: BoardState | null
  onResume: () => void
  onDiscard: () => void
  onStart: (cfg: { teams: string[]; count: number; secs: number; seed: number }) => void
}) {
  const [settings] = useState(loadSettings)
  const [teams, setTeams] = useState<string[]>(settings.teams)
  const [count, setCount] = useState(settings.count)
  const [secs, setSecs] = useState(settings.secs)
  const [seed, setSeed] = useState(newSeed)
  const preview = useMemo(() => gameItems({ game: id, seed, count }) ?? [], [id, seed, count])
  const { chapter, set } = found

  const setTeamCount = (n: number) => {
    const k = Math.min(MAX_TEAMS, Math.max(MIN_TEAMS, n))
    setTeams((t) => Array.from({ length: k }, (_, i) => t[i] ?? TEAM_NAMES.find((nm) => !t.includes(nm)) ?? `Team ${i + 1}`))
  }
  const names = teams.map((t, i) => t.trim() || `Team ${i + 1}`)

  return (
    <div className="grid gap-6" style={{ ['--hue' as string]: chapter.colour }}>
      <Link to="/games" className="btn btn-ghost btn-sm w-fit">
        <ArrowLeft size={16} aria-hidden="true" /> All class games
      </Link>

      <header className="topic-tile cursor-default hover:transform-none">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip chip-book">{set ? set.ref : chapter.ref}</span>
          <span className="chip">Year {found.book.year}</span>
          {(set ? set.outcomes : chapter.outcomes).map((o) => (
            <span key={o} className="chip chip-code" title="NSW syllabus outcome">
              {o}
            </span>
          ))}
        </div>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{set ? set.title : `${chapter.title}: whole chapter mix`}</h1>
        <p className="max-w-3xl text-muted-foreground">{set ? set.focus : `One quick question from each exercise of ${chapter.ref}, in textbook order.`}</p>
        {set?.teacherNote && <p className="max-w-3xl text-sm text-muted-foreground">{set.teacherNote}</p>}
      </header>

      {saved && (
        <section className="panel grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center" aria-label="Game in progress">
          <div>
            <h2 className="font-display text-xl font-semibold">A game is in progress</h2>
            <p className="text-muted-foreground">
              Question {saved.i + 1} of {saved.cfg.count} · {saved.cfg.teams.join(', ')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={onResume}>
              <Play size={18} aria-hidden="true" /> Carry on
            </button>
            <button type="button" className="btn btn-ghost" onClick={onDiscard}>
              Start again
            </button>
          </div>
        </section>
      )}

      <form
        className="grid gap-6 lg:grid-cols-[1.3fr_1fr]"
        onSubmit={(e) => {
          e.preventDefault()
          onStart({ teams: names, count, secs, seed })
        }}
      >
        <section className="panel grid content-start gap-5 p-5" aria-labelledby="setup">
          <h2 id="setup" className="font-display text-2xl font-semibold">
            Set up the game
          </h2>

          <div className="grid gap-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="label mb-0" id="teams-label">
                Teams
              </span>
              <div className="flex items-center gap-2" role="group" aria-labelledby="teams-label">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTeamCount(teams.length - 1)} disabled={teams.length <= MIN_TEAMS} aria-label="One team fewer">
                  <Minus size={16} aria-hidden="true" />
                </button>
                <span className="font-display min-w-8 text-center text-xl font-semibold" aria-live="polite">
                  {teams.length}
                </span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTeamCount(teams.length + 1)} disabled={teams.length >= MAX_TEAMS} aria-label="One more team">
                  <Plus size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {teams.map((t, i) => (
                <label key={i} className={cn('gs-team', `team-${i}`)}>
                  <span className="tnum" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="sr-only">Team {i + 1} name</span>
                  <input
                    className="field"
                    value={t}
                    maxLength={16}
                    onChange={(e) => setTeams((ts) => ts.map((x, k) => (k === i ? e.target.value : x)))}
                    placeholder={`Team ${i + 1}`}
                    autoComplete="off"
                  />
                </label>
              ))}
            </div>
          </div>

          <fieldset className="grid gap-2">
            <legend className="label">Questions</legend>
            <div className="tabs w-fit" role="radiogroup" aria-label="Number of questions">
              {GAME_LENGTHS.map((n) => (
                <button key={n} type="button" role="radio" aria-checked={n === count} className={n === count ? 'active' : ''} onClick={() => setCount(n)}>
                  {n}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="grid gap-2">
            <legend className="label">Time for each question</legend>
            <div className="tabs w-fit" role="radiogroup" aria-label="Seconds for each question">
              {TIMER_CHOICES.map((s) => (
                <button key={s} type="button" role="radio" aria-checked={s === secs} className={s === secs ? 'active' : ''} onClick={() => setSecs(s)}>
                  {s === 0 ? 'No timer' : `${s} s`}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              About {Math.max(3, Math.round((count * ((secs || 20) + 25)) / 60))} minutes for {count} questions.
            </p>
          </fieldset>

          <button type="submit" className="btn btn-primary btn-lg w-fit">
            <Play size={20} aria-hidden="true" /> Start the game
          </button>
        </section>

        <section className="panel grid content-start gap-3 p-5" aria-labelledby="how">
          <h2 id="how" className="font-display text-2xl font-semibold">
            How to play
          </h2>
          <ol className="grid gap-3">
            {[
              'Put the class in teams. Each team needs a mini whiteboard or paper.',
              'Every team answers every question, then holds up A, B, C or D when the time is up.',
              'Show the answer and tick each team that got it right.',
              'Each team that was right digs up a log: mostly termites, sometimes a surprise. Most termites at the end wins.',
            ].map((s, k) => (
              <li key={k} className="flex gap-3">
                <span className="tile-mark grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft font-bold text-primary">{k + 1}</span>
                <p className="pt-1">{s}</p>
              </li>
            ))}
          </ol>
          <p className="text-sm text-muted-foreground">Every question is one step and made to be done in the head. No calculators needed.</p>
        </section>
      </form>

      <details className="panel p-5">
        <summary className="font-display cursor-pointer text-xl font-semibold">See the questions first (for the teacher)</summary>
        <div className="mt-3 grid gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">These are the {preview.length} questions this game will ask, with the right answers marked.</p>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSeed(newSeed())}>
              <Shuffle size={14} aria-hidden="true" /> Different questions
            </button>
          </div>
          <ol className="grid gap-3">
            {preview.map((it, k) => (
              <li key={k} className="gs-preview">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-display font-semibold">Q{k + 1}</span>
                  {!set && <span className="chip chip-book">Ex {it.set.exercise}</span>}
                  <MathHtml inline html={it.q.prompt} />
                </div>
                {(it.q.diagram || it.q.note) && (
                  <div className="gs-preview-diagram">
                    <Diagram svg={it.q.diagram} note={it.q.note} />
                  </div>
                )}
                <ul className="gs-preview-options">
                  {it.q.options.map((o, j) => (
                    <li key={j} className={j === it.q.correct ? 'right' : ''}>
                      <strong>{LETTERS[j]}</strong> <MathHtml inline html={o} />
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground">
                  <MathHtml inline html={it.q.why} />
                </p>
              </li>
            ))}
          </ol>
        </div>
      </details>

      {saved && (
        <p className="text-sm text-muted-foreground">
          <RotateCcw size={14} className="mr-1 inline" aria-hidden="true" />
          Starting a new game replaces the one in progress.
        </p>
      )}
    </div>
  )
}
