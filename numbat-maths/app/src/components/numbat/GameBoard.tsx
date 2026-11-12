// The class game on the board: a question for every team, the answer, then each team that was right digs.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowLeftRight, ArrowRight, Bug, Check, Eye, Flag, Maximize, Pause, Play, RotateCcw, Sparkles, Swords, Trophy, Undo2, X } from 'lucide-react'
import type { GameItem } from '@/lib/game/types'
import { places, type Find } from '@/lib/game/luck'
import { type BoardState, clearBoard, digRound, markAll, nextQuestion, reveal, saveBoard, scoresDuring, toggleTeam, undoDig } from '@/lib/board'
import { cn } from '@/lib/utils'
import { ConfirmBar } from './ConfirmBar'
import { Diagram, MathHtml } from './MathHtml'
import { useFocusMode } from './Shell'

const LETTERS = ['A', 'B', 'C', 'D']
const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th']
const prefersReducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** A numbat-sized log: what every dig turns over. */
function LogIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden="true">
      <rect x="6" y="8" width="52" height="24" rx="12" className="log-body" />
      <ellipse cx="52" cy="20" rx="6" ry="12" className="log-end" />
      <ellipse cx="52" cy="20" rx="2.6" ry="5.5" className="log-ring" />
      <path d="M16 15h18M22 25h16" className="log-grain" />
    </svg>
  )
}

/** An echidna: a round back of spines and a long snout. */
function EchidnaIcon({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 32" width={size * 1.5} height={size} aria-hidden="true" className="echidna">
      <path d="M8 26c0-10 7-17 17-17s15 7 15 17z" className="e-body" />
      <path d="M12 14l-3-6M18 10l-1-7M25 8l1-7M32 10l4-6M37 15l6-4" className="e-spine" />
      <path d="M39 22l8 2-8 2z" className="e-body" />
      <circle cx="36" cy="20" r="1.4" className="e-eye" />
    </svg>
  )
}

function findText(f: Find, teams: string[]): { title: string; detail: string; icon: React.ReactNode } {
  switch (f.kind) {
    case 'double':
      return { title: 'Double dig!', detail: `2 × ${f.base} termites`, icon: <span className="gb-x2">×2</span> }
    case 'golden':
      return { title: 'Golden log!', detail: 'A log packed with termites', icon: <Sparkles aria-hidden="true" /> }
    case 'echidna':
      return { title: 'An echidna got there first', detail: 'Only a few termites left', icon: <EchidnaIcon /> }
    case 'raid':
      return { title: 'Raid!', detail: `${f.otherLoss} termites taken from the ${teams[f.other ?? 0]}`, icon: <Swords aria-hidden="true" /> }
    case 'leapfrog':
      return { title: 'Leapfrog!', detail: `Swapped termites with the ${teams[f.other ?? 0]}`, icon: <ArrowLeftRight aria-hidden="true" /> }
    default:
      return { title: 'Termites!', detail: 'A good log', icon: <Bug aria-hidden="true" /> }
  }
}

function Countdown({ secs, left, paused, onToggle, timeUp }: { secs: number; left: number; paused: boolean; onToggle: () => void; timeUp: boolean }) {
  return (
    <div className="gb-clock" role="timer" aria-label={timeUp ? 'Time is up' : `${left} seconds left`}>
      <div className={cn('gb-timer', left <= 5 && 'low')} aria-hidden="true">
        <span style={{ width: `${(left / secs) * 100}%` }} />
      </div>
      <span className={cn('gb-secs', left <= 5 && 'low')} aria-hidden="true">
        {left}
      </span>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onToggle} disabled={timeUp} aria-label={paused ? 'Start the timer again' : 'Pause the timer'}>
        {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
        <span className="max-sm:sr-only">{paused ? 'Resume' : 'Pause'}</span>
      </button>
    </div>
  )
}

export function GameBoard({
  items,
  initial,
  title,
  onExit,
  onAgain,
}: {
  items: GameItem[]
  initial: BoardState
  /** e.g. "NCM 7 Ex 8.05 · Area of a rectangle" */
  title: string
  /** leave the game (it stays saved, so it can be carried on) */
  onExit: () => void
  /** a new game with the same teams and settings */
  onAgain: () => void
}) {
  const [b, setB] = useState<BoardState>(initial)
  const total = items.length
  const teams = b.cfg.teams
  const secs = b.cfg.secs
  const [left, setLeft] = useState(secs)
  const [paused, setPaused] = useState(false)
  const [shown, setShown] = useState(() => (initial.phase === 'dug' ? (initial.rounds[initial.rounds.length - 1]?.finds.length ?? 0) : 0))
  const [confirmEnd, setConfirmEnd] = useState(false)
  // full screen is offered only where the browser allows it (not inside every embedded page)
  const [canFullScreen] = useState(() => typeof document !== 'undefined' && !!document.fullscreenEnabled)
  const toggleFullScreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
    else void document.documentElement.requestFullscreen().catch(() => {})
  }
  const stageRef = useRef<HTMLDivElement>(null)
  useFocusMode(true)

  // keep the game's place on this device; a finished game is not carried on
  useEffect(() => {
    if (b.phase === 'done') clearBoard()
    else saveBoard(b)
  }, [b])

  // a fresh countdown for each question
  useEffect(() => {
    setLeft(secs)
    setPaused(false)
  }, [b.i, secs])

  const counting = b.phase === 'ask' && secs > 0 && !paused && left > 0
  useEffect(() => {
    if (!counting) return
    const id = window.setTimeout(() => setLeft((x) => Math.max(0, x - 1)), 1000)
    return () => window.clearTimeout(id)
  }, [counting, left])

  // the round's finds turn over one at a time
  const round = b.phase === 'dug' ? b.rounds[b.rounds.length - 1] : undefined
  const findCount = round?.finds.length ?? 0
  useEffect(() => {
    if (b.phase !== 'dug' || shown >= findCount) return
    const id = window.setTimeout(() => setShown((x) => x + 1), shown === 0 ? 350 : 800)
    return () => window.clearTimeout(id)
  }, [b.phase, shown, findCount])

  const cur = items[Math.min(b.i, total - 1)]
  const scores = round ? scoresDuring(round, shown) : b.scores
  const rank = useMemo(() => places(scores), [scores])
  const anyScore = scores.some((s) => s > 0)
  const allShown = b.phase !== 'dug' || shown >= findCount

  const doReveal = useCallback(() => setB((x) => reveal(x)), [])
  const doDig = useCallback(() => {
    setShown(prefersReducedMotion() ? 99 : 0)
    setB((x) => digRound(x))
  }, [])
  const doNext = useCallback(() => {
    setShown(0)
    setB((x) => nextQuestion(x, total))
  }, [total])
  const doUndo = useCallback(() => {
    setShown(0)
    setB((x) => undoDig(x))
  }, [])

  const primary = useCallback(() => {
    if (b.phase === 'ask') doReveal()
    else if (b.phase === 'reveal') doDig()
    else if (b.phase === 'dug') {
      if (!allShown) setShown(99)
      else doNext()
    }
  }, [b.phase, allShown, doReveal, doDig, doNext])

  // Keys for a teacher at the laptop: Space or Enter for the next step, 1–6 to tick a team, A for all teams.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || confirmEnd) return
      const el = e.target as HTMLElement | null
      const tag = el?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === ' ' || e.key === 'Enter') {
        // a focused button already acts on these keys
        if (tag === 'BUTTON' || tag === 'A') return
        e.preventDefault()
        primary()
        return
      }
      if (b.phase === 'reveal') {
        const n = Number(e.key)
        if (Number.isInteger(n) && n >= 1 && n <= teams.length) {
          e.preventDefault()
          setB((x) => toggleTeam(x, n - 1))
        } else if (e.key === 'a' || e.key === 'A') setB((x) => markAll(x, x.marked.length !== x.cfg.teams.length))
      }
      if (b.phase === 'ask' && secs > 0 && (e.key === 'p' || e.key === 'P')) setPaused((p) => !p)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [b.phase, primary, teams.length, secs, confirmEnd])

  // a new question, the answer or the finds: back to the top on small screens
  useEffect(() => {
    stageRef.current?.scrollIntoView?.({ block: 'nearest' })
  }, [b.i, b.phase])

  if (b.phase === 'done') return <Podium b={b} items={items} title={title} onAgain={onAgain} onExit={onExit} />

  const timeUp = b.phase === 'ask' && secs > 0 && left === 0
  const lastQuestion = b.i + 1 >= total

  return (
    <div className="gb">
      <div className="gb-top">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onExit}>
          <ArrowLeft size={16} aria-hidden="true" /> <span className="max-sm:sr-only">Leave game</span>
        </button>
        <span className="gb-title">{title}</span>
        <span className="gb-count" aria-live="polite">
          Question {b.i + 1} <span className="text-muted-foreground">of {total}</span>
        </span>
        {b.phase === 'ask' && secs > 0 && <Countdown secs={secs} left={left} paused={paused} onToggle={() => setPaused((p) => !p)} timeUp={timeUp} />}
        <span className="ml-auto flex items-center gap-2">
          {canFullScreen && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={toggleFullScreen}>
              <Maximize size={16} aria-hidden="true" /> <span className="max-[1100px]:sr-only">Full screen</span>
            </button>
          )}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmEnd(true)}>
            <Flag size={16} aria-hidden="true" /> <span className="max-sm:sr-only">Finish now</span>
          </button>
        </span>
      </div>

      {confirmEnd && (
        <ConfirmBar
          message="Finish the game now and show the winners?"
          confirmLabel="Finish now"
          cancelLabel="Keep playing"
          onConfirm={() => {
            setConfirmEnd(false)
            setB((x) => ({ ...x, phase: 'done' }))
          }}
          onCancel={() => setConfirmEnd(false)}
        />
      )}

      <div className="gb-body">
        <section className="gb-stage" ref={stageRef} aria-label={`Question ${b.i + 1}`}>
          {b.phase !== 'dug' ? (
            <>
              <div className="gb-q">
                {cur.set.id !== b.cfg.game && <span className="chip chip-book w-fit">Ex {cur.set.exercise} · {cur.set.title}</span>}
                <MathHtml className={cn('gb-prompt', cur.q.prompt.replace(/<[^>]*>/g, '').length > 80 && 'long')} html={cur.q.prompt} />
                {(cur.q.diagram || cur.q.note) && (
                  <div className="gb-diagram">
                    <Diagram svg={cur.q.diagram} note={cur.q.note} />
                  </div>
                )}
              </div>
              <ol
                className={cn(
                  'gb-options',
                  // short choices under a diagram go in one row, which leaves the diagram more room
                  !!cur.q.diagram && cur.q.options.every((o) => o.replace(/<[^>]*>/g, '').length <= (b.phase === 'reveal' ? 18 : 10)) && 'row4',
                  b.phase === 'reveal' && 'revealed',
                )}
                aria-label="Choices"
              >
                {cur.q.options.map((o, k) => {
                  const right = b.phase === 'reveal' && k === cur.q.correct
                  return (
                    <li key={k} className={cn('gb-opt', right && 'right', b.phase === 'reveal' && !right && 'dim')}>
                      <span className="letter" aria-hidden="true">
                        {right ? <Check size={22} strokeWidth={3.5} /> : LETTERS[k]}
                      </span>
                      <span className="sr-only">{LETTERS[k]}: </span>
                      <MathHtml inline html={o} />
                      {right && <span className="sr-only"> (the right answer)</span>}
                    </li>
                  )
                })}
              </ol>
              {b.phase === 'reveal' && (
                <div className="gb-why" role="status">
                  <strong>
                    {LETTERS[cur.q.correct]}: <MathHtml inline html={cur.q.options[cur.q.correct]} />
                  </strong>
                  <MathHtml inline html={cur.q.why} />
                </div>
              )}
              {timeUp && (
                <p className="gb-timeup celebrate" role="status">
                  Time’s up! Answers up.
                </p>
              )}
            </>
          ) : (
            <div className="gb-dig">
              <h2 className="font-display gb-dig-title">
                <LogIcon className="gb-log" /> {findCount ? 'Dig time!' : 'No digs this round'}
              </h2>
              {findCount === 0 && <p className="text-muted-foreground">No team was ticked for this question, so the totals stay as they were.</p>}
              <ul className="gb-finds">
                {round!.finds.map((f, k) => {
                  const t = findText(f, teams)
                  return k < shown ? (
                    <li key={k} className={cn('gb-find', `team-${f.team}`, `find-${f.kind}`)}>
                      <span className="who">{teams[f.team]}</span>
                      <span className="icon">{t.icon}</span>
                      <span className="what">{t.title}</span>
                      <span className="gain">+{f.gain}</span>
                      <span className="detail">{t.detail}</span>
                    </li>
                  ) : (
                    <li key={k} className={cn('gb-find is-closed', `team-${f.team}`)} aria-hidden="true">
                      <span className="who">{teams[f.team]}</span>
                      <LogIcon className="gb-log-big" />
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </section>

        <aside className="gb-rail" aria-label="Teams">
          {b.phase === 'reveal' && <p className="gb-rail-tip">Tick every team that got it right.</p>}
          {teams.map((name, t) => {
            const on = b.marked.includes(t)
            const dugNow = round?.finds.findIndex((f) => f.team === t) ?? -1
            const inner = (
              <>
                <span className="tnum" aria-hidden="true">
                  {b.phase === 'reveal' && on ? <Check size={20} strokeWidth={3.5} /> : t + 1}
                </span>
                <span className="tname">{name}</span>
                <span className={cn('tplace', anyScore && rank[t] === 1 && 'first')}>{anyScore ? ORDINALS[rank[t] - 1] : ''}</span>
                <span className="tscore">
                  {scores[t]}
                  <span className="sr-only"> termites</span>
                </span>
              </>
            )
            return b.phase === 'reveal' ? (
              <button key={t} type="button" className={cn('gb-team', `team-${t}`, on && 'is-on')} aria-pressed={on} onClick={() => setB((x) => toggleTeam(x, t))}>
                {inner}
              </button>
            ) : (
              <div key={t} className={cn('gb-team', `team-${t}`, round && dugNow >= 0 && dugNow < shown && 'is-on')}>
                {inner}
              </div>
            )
          })}
          {b.phase === 'reveal' && (
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setB((x) => markAll(x, true))}>
                All teams
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setB((x) => markAll(x, false))}>
                <X size={14} aria-hidden="true" /> Clear
              </button>
            </div>
          )}

          <div className="gb-actions">
            {b.phase === 'ask' && (
              <button type="button" className={cn('btn btn-primary btn-lg gb-main', timeUp && 'pulse')} onClick={doReveal}>
                <Eye size={20} aria-hidden="true" /> Show the answer
              </button>
            )}
            {b.phase === 'reveal' && (
              <button type="button" className="btn btn-primary btn-lg gb-main" onClick={doDig}>
                {b.marked.length ? (
                  <>
                    <Bug size={20} aria-hidden="true" /> Dig! ({b.marked.length} team{b.marked.length === 1 ? '' : 's'})
                  </>
                ) : (
                  <>
                    Nobody got it <ArrowRight size={20} aria-hidden="true" />
                  </>
                )}
              </button>
            )}
            {b.phase === 'dug' && (
              <>
                <button type="button" className="btn btn-primary btn-lg gb-main" onClick={primary}>
                  {!allShown ? (
                    'Show all'
                  ) : lastQuestion ? (
                    <>
                      <Trophy size={20} aria-hidden="true" /> See the winners
                    </>
                  ) : (
                    <>
                      Next question <ArrowRight size={20} aria-hidden="true" />
                    </>
                  )}
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={doUndo}>
                  <Undo2 size={14} aria-hidden="true" /> Undo this dig
                </button>
              </>
            )}
            <p className="gb-keys">
              <kbd>Space</kbd> next step{b.phase === 'reveal' ? <> · <kbd>1</kbd>–<kbd>{teams.length}</kbd> tick a team · <kbd>A</kbd> all</> : null}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Podium({ b, items, title, onAgain, onExit }: { b: BoardState; items: GameItem[]; title: string; onAgain: () => void; onExit: () => void }) {
  const teams = b.cfg.teams
  const rank = places(b.scores)
  const order = teams.map((_, t) => t).sort((x, y) => b.scores[y] - b.scores[x] || x - y)
  const top = Math.max(1, ...b.scores)
  const winners = order.filter((t) => rank[t] === 1)
  const played = b.rounds.length
  const nobody = b.scores.every((s) => s === 0)
  const rightCounts = teams.map((_, t) => b.rounds.filter((r) => r.right.includes(t)).length)
  const hard = b.rounds
    .map((r, k) => ({ k, n: r.right.length }))
    .filter((x) => x.n <= teams.length / 2)
    .sort((x, y) => x.n - y.n || x.k - y.k)
    .slice(0, 3)
  return (
    <div className="gb-podium">
      <header className="grid justify-items-center gap-2 text-center">
        <Trophy size={44} className="text-sun celebrate" aria-hidden="true" />
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">
          {nobody ? 'Game over' : winners.length > 1 ? `It’s a tie: ${winners.map((t) => teams[t]).join(' and ')}!` : `The ${teams[winners[0]]} win!`}
        </h1>
        <p className="text-muted-foreground">
          {title} · {played} question{played === 1 ? '' : 's'} played
        </p>
      </header>

      <ol className="gb-ranks" aria-label="Final places">
        {order.map((t) => (
          <li key={t} className={cn('gb-rank', `team-${t}`, rank[t] === 1 && !nobody && 'first')}>
            <span className="place">{ORDINALS[rank[t] - 1]}</span>
            <span className="name">{teams[t]}</span>
            <span className="barwrap" aria-hidden="true">
              <span className="bar" style={{ width: `${Math.max(2, (b.scores[t] / top) * 100)}%` }} />
            </span>
            <span className="score">
              {b.scores[t]} <span className="unit">termites</span>
            </span>
            <span className="rights">
              {rightCounts[t]} of {played} right
            </span>
          </li>
        ))}
      </ol>

      {hard.length > 0 && (
        <section className="panel grid gap-2 p-4" aria-labelledby="look-again">
          <h2 id="look-again" className="font-display text-xl font-semibold">
            Worth another look
          </h2>
          <p className="text-sm text-muted-foreground">The questions the fewest teams got right.</p>
          <ul className="grid gap-2">
            {hard.map(({ k, n }) => (
              <li key={k} className="gb-review">
                <span className="chip">
                  Q{k + 1} · {n} of {teams.length} teams
                </span>
                <MathHtml inline html={items[k].q.prompt} />
                <span className="text-muted-foreground">
                  {' '}
                  Answer: <MathHtml inline html={items[k].q.options[items[k].q.correct]} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" className="btn btn-primary btn-lg" onClick={onAgain}>
          <RotateCcw size={18} aria-hidden="true" /> Play again with new questions
        </button>
        <button type="button" className="btn btn-ghost btn-lg" onClick={onExit}>
          Choose another game
        </button>
      </div>
    </div>
  )
}
