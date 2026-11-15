// One class game: choose the teams and the length, then play it on the board.
import { useMemo, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Minus, Play, Plus, Printer, RotateCcw, Shuffle } from 'lucide-react'
import { GameBoard } from '@/components/numbat/GameBoard'
import { Diagram, MathHtml } from '@/components/numbat/MathHtml'
import { NotFoundPanel, PageLoading, Shell } from '@/components/numbat/Shell'
import { findGame, gameChapters, gameTitle, type FoundGame } from '@/content/games'
import {
  type BoardState, clearBoard, gameItems, loadBoard, loadSettings, MAX_TEAMS, MIN_TEAMS, newBoard, saveSettings, TEAM_NAMES, TIMER_CHOICES, SUGGESTED,
} from '@/lib/board'
import { GAME_LENGTHS, hasCalc, suggestedSecs } from '@/lib/game/build'
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

  const start = (cfg: StartCfg) => {
    saveSettings({ teams: cfg.teams, count: cfg.count, secs: cfg.secs, speed: cfg.speed })
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
        onExit={() => void navigate({ to: '/games', search: { chapter: found.chapter.id } })}
        onAgain={() => start({ teams: board.cfg.teams, count: board.cfg.count, secs: board.cfg.secs, seed: newSeed(), speed: board.cfg.speed, calc: board.cfg.calc })}
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

type StartCfg = { teams: string[]; count: number; secs: number; seed: number; speed?: boolean; calc?: boolean }

const HOW_TEAMS = [
  'Put the class in teams. Each team needs a mini whiteboard or paper.',
  'Every team answers every question, then holds up A, B, C or D when the time is up.',
  'Show the answer and tick each team that got it right.',
  'Each team that was right digs up a log: mostly termites, sometimes a surprise. Most termites at the end wins.',
]
const HOW_SPEED = [
  'Put the class in teams. One person in each team answers for it.',
  'When a team knows the answer, a hand goes up. Click that team (or press its number): it says A, B, C or D.',
  'Right: the team digs up a log. Wrong: that team is out for this question and the clock starts again for the rest.',
  'Nobody right? Show the answer and move on. Most termites at the end wins.',
]

/** "Suggested", "No timer", "45 s", "1 min", "1½ min", "2 min" */
const timeLabel = (s: number) => (s === SUGGESTED ? 'Suggested' : s === 0 ? 'No timer' : s === 90 ? '1½ min' : s >= 60 ? `${s / 60} min` : `${s} s`)

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
  onStart: (cfg: StartCfg) => void
}) {
  const [settings] = useState(loadSettings)
  const [speed, setSpeed] = useState(!!settings.speed)
  const offerCalc = hasCalc(found.set ? [found.set] : found.upTo ? found.book.chapters.slice(0, found.upTo).flatMap((c) => c.sets) : found.chapter.sets)
  const [calc, setCalc] = useState(false)
  const [teams, setTeams] = useState<string[]>(settings.teams)
  const [count, setCount] = useState(settings.count)
  const [secs, setSecs] = useState(settings.secs)
  const [seed, setSeed] = useState(newSeed)
  const preview = useMemo(() => gameItems({ game: id, seed, count, calc: offerCalc && calc }) ?? [], [id, seed, count, calc, offerCalc])
  const { chapter, set, upTo } = found
  // each question's suggested time, for the "Suggested" choice and the length of the game
  const times = useMemo(() => preview.map(suggestedSecs), [preview])
  const lo = times.length ? Math.min(...times) : 20
  const hi = times.length ? Math.max(...times) : 20
  const perQuestion = secs === SUGGESTED ? times.reduce((t, x) => t + x, 0) / Math.max(1, times.length) : secs || 30
  const outcomes = set ? set.outcomes : [...new Set(gameChapters(found).flatMap((c) => c.outcomes))]

  const setTeamCount = (n: number) => {
    const k = Math.min(MAX_TEAMS, Math.max(MIN_TEAMS, n))
    setTeams((t) => Array.from({ length: k }, (_, i) => t[i] ?? TEAM_NAMES.find((nm) => !t.includes(nm)) ?? `Team ${i + 1}`))
  }
  const names = teams.map((t, i) => t.trim() || `Team ${i + 1}`)

  return (
    <div className="grid gap-6" style={{ ['--hue' as string]: chapter.colour }}>
      <Link to="/games" search={{ chapter: chapter.id }} className="btn btn-ghost btn-sm w-fit">
        <ArrowLeft size={16} aria-hidden="true" /> All class games
      </Link>

      <header className="topic-tile cursor-default hover:transform-none">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip chip-book">{set ? set.ref : upTo ? `${found.book.short} Chapters 1–${upTo}` : chapter.ref}</span>
          <span className="chip">Year {found.book.year}</span>
          {outcomes.map((o) => (
            <span key={o} className="chip chip-code" title="NSW syllabus outcome">
              {o}
            </span>
          ))}
        </div>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{set ? set.title : upTo ? 'Year revision mix' : `${chapter.title}: whole chapter mix`}</h1>
        <p className="max-w-3xl text-muted-foreground">
          {set
            ? set.focus
            : upTo
              ? `Questions from every chapter studied so far (Chapters 1 to ${upTo} of ${found.book.short}), with older chapters coming up more often, for yearly exam revision.`
              : `One quick question from each exercise of ${chapter.ref}, in textbook order.`}
        </p>
        {!upTo && (
          <Link to="/worksheet" search={{ id }} className="btn btn-ghost btn-sm w-fit">
            <Printer size={16} aria-hidden="true" /> Print as a worksheet or test
          </Link>
        )}
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
          onStart({ teams: names, count, secs, seed, speed, calc: offerCalc && calc })
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
            <legend className="label">Game</legend>
            <div className="tabs w-fit" role="radiogroup" aria-label="Kind of game">
              <button type="button" role="radio" aria-checked={!speed} className={!speed ? 'active' : ''} onClick={() => setSpeed(false)}>
                Every team answers
              </button>
              <button type="button" role="radio" aria-checked={speed} className={speed ? 'active' : ''} onClick={() => setSpeed(true)}>
                Speed round
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              {speed ? 'The first team to put a hand up answers. Right digs; wrong is out for that question.' : 'Every team writes an answer to every question.'}
            </p>
          </fieldset>

          {offerCalc && (
            <fieldset className="grid gap-2">
              <legend className="label">Calculators</legend>
              <div className="tabs w-fit" role="radiogroup" aria-label="Calculators">
                <button type="button" role="radio" aria-checked={!calc} className={!calc ? 'active' : ''} onClick={() => setCalc(false)}>
                  Not allowed
                </button>
                <button type="button" role="radio" aria-checked={calc} className={calc ? 'active' : ''} onClick={() => setCalc(true)}>
                  Allowed
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                {calc
                  ? 'Calculator questions (answers rounded) are mixed in and marked on the board. Check calculators are in degree mode.'
                  : 'Every question can be done in the head.'}
              </p>
            </fieldset>
          )}

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
                  {timeLabel(s)}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {secs === SUGGESTED && (
                <>
                  Suggested: each question gets its own time from the working it needs
                  {lo === hi ? `, ${lo} s for these questions` : `, from ${lo} s to ${hi} s for these questions`}.{' '}
                </>
              )}
              During the game, −15 s and +15 s beside the clock (or the − and + keys) change the time for that question and the rest.{' '}
              About {Math.max(3, Math.round((count * (perQuestion + 25)) / 60))} minutes for {count} questions.
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
            {(speed ? HOW_SPEED : HOW_TEAMS).map((s, k) => (
              <li key={k} className="flex gap-3">
                <span className="tile-mark grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft font-bold text-primary">{k + 1}</span>
                <p className="pt-1">{s}</p>
              </li>
            ))}
          </ol>
          <p className="text-sm text-muted-foreground">
            {offerCalc && calc
              ? 'Questions marked “Calculator” need one; the rest are done in the head.'
              : 'Every question is one step and made to be done in the head. No calculators needed.'}
          </p>
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
                  {it.calc && <span className="chip">Calculator</span>}
                  <span className="chip" title="Suggested time">
                    {times[k]} s
                  </span>
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
