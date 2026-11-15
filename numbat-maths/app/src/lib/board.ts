// A class game played on the board: its settings, its saved place and the steps of each round.
// The questions aren't stored: the game's seed rebuilds exactly the same questions, so a game that is
// interrupted (the page is refreshed, the laptop goes to sleep) can carry on where it stopped.
import { findGame, gameChapters } from '@/content/games'
import { buildChapterGame, buildGame, buildRevisionGame, DEFAULT_LENGTH, GAME_LENGTHS, gameCheck, suggestedSecs } from '@/lib/game/build'
import { dig, type Find } from '@/lib/game/luck'
import type { GameItem } from '@/lib/game/types'
import { loadJson, save, saveJson } from './storage'

export const TEAM_NAMES = ['Numbats', 'Quokkas', 'Bilbies', 'Wombats', 'Possums', 'Dingoes']
export const MIN_TEAMS = 2
export const MAX_TEAMS = 6
/** each question gets its own suggested time (suggestedSecs in src/lib/game/build.ts) */
export const SUGGESTED = -1
/** seconds to answer each question: suggested per question, a fixed time, or 0 for no countdown */
export const TIMER_CHOICES = [SUGGESTED, 10, 15, 20, 30, 45, 60, 90, 120, 0] as const
export const DEFAULT_SECS = SUGGESTED
/** the teacher's "− 15 s" and "+ 15 s" during a game */
export const ADJUST_STEP = 15
const MIN_SECS = 10
const MAX_SECS = 300

/** Seconds for one question: its suggested time or the fixed time, plus the teacher's change during the game.
 *  0 when the countdown is off. */
export function questionSecs(secs: number, adjust: number, item: GameItem | undefined): number {
  if (secs === 0) return 0
  const base = secs === SUGGESTED ? (item ? suggestedSecs(item) : 30) : secs
  return Math.min(MAX_SECS, Math.max(MIN_SECS, base + adjust))
}

export interface BoardConfig {
  /** a game id from the content: one exercise ("ncm7-8.05") or a whole chapter ("ncm7-ch8") */
  game: string
  seed: number
  count: number
  secs: number
  teams: string[]
  /** speed round: the first team to put a hand up answers; right digs, wrong is out for that question */
  speed?: boolean
  /** calculators allowed: calculator kinds are asked too */
  calc?: boolean
}

/** ask: the question is up. reveal: the answer is showing and the teacher ticks the teams that were right.
 *  dug: this round's finds are showing. done: the game is over. */
export type Phase = 'ask' | 'reveal' | 'dug' | 'done'

export interface Round {
  /** the teams that got the question right */
  right: number[]
  finds: Find[]
  /** every team's total before the round, so it can be undone */
  before: number[]
}

export interface BoardState {
  v: 1
  cfg: BoardConfig
  /** fingerprint of the questions, to check a saved game rebuilds the same ones */
  check: string
  i: number
  phase: Phase
  scores: number[]
  rounds: Round[]
  /** the teams ticked so far for the question on the board */
  marked: number[]
  /** speed round: the team answering now, and the teams already wrong on this question */
  buzz?: number | null
  out?: number[]
  /** seconds the teacher has added (or taken off, if negative) to every question from the one where it was changed */
  adjust?: number
  savedAt: number
}

const KEY = 'numbat.game'
const SETTINGS_KEY = 'numbat.gameSettings'
const KEEP_HOURS = 18

export interface BoardSettings {
  teams: string[]
  count: number
  secs: number
  speed?: boolean
}

const cleanName = (s: unknown, i: number) => (typeof s === 'string' && s.trim() ? s.trim().slice(0, 16) : TEAM_NAMES[i] ?? `Team ${i + 1}`)

/** The settings used last time on this device (teams, length, timer), tidied up. */
export function loadSettings(): BoardSettings {
  const s = loadJson<Partial<BoardSettings>>(SETTINGS_KEY, {})
  const n = Array.isArray(s.teams) ? Math.min(MAX_TEAMS, Math.max(MIN_TEAMS, s.teams.length)) : 4
  return {
    teams: Array.from({ length: n }, (_, i) => cleanName(s.teams?.[i], i)),
    count: (GAME_LENGTHS as readonly number[]).includes(s.count as number) ? (s.count as number) : DEFAULT_LENGTH,
    secs: (TIMER_CHOICES as readonly number[]).includes(s.secs as number) ? (s.secs as number) : DEFAULT_SECS,
    speed: s.speed === true,
  }
}

export function saveSettings(s: BoardSettings) {
  saveJson(SETTINGS_KEY, s)
}

/** The questions of a game, rebuilt from its settings. Null if the game id isn't in this build. */
export function gameItems(cfg: Pick<BoardConfig, 'game' | 'seed' | 'count' | 'calc'>): GameItem[] | null {
  const g = findGame(cfg.game)
  if (!g) return null
  const calc = !!cfg.calc
  if (g.upTo) return buildRevisionGame(gameChapters(g), cfg.seed, cfg.count, calc)
  return g.set ? buildGame(g.set, cfg.seed, cfg.count, calc) : buildChapterGame(g.chapter, cfg.seed, cfg.count, calc)
}

export function newBoard(cfg: BoardConfig, items: GameItem[]): BoardState {
  return { v: 1, cfg, check: gameCheck(items), i: 0, phase: 'ask', scores: cfg.teams.map(() => 0), rounds: [], marked: [], savedAt: Date.now() }
}

/** A game left unfinished on this device, if it is recent and still rebuilds the same questions. */
export function loadBoard(): BoardState | null {
  const b = loadJson<BoardState | null>(KEY, null)
  if (!b || b.v !== 1 || !b.cfg || b.phase === 'done') return null
  if (Date.now() - b.savedAt > KEEP_HOURS * 3_600_000) return null
  const items = gameItems(b.cfg)
  if (!items || gameCheck(items) !== b.check || b.scores?.length !== b.cfg.teams.length || b.i >= items.length) return null
  return b
}

export function saveBoard(b: BoardState) {
  saveJson(KEY, { ...b, savedAt: Date.now() })
}

export function clearBoard() {
  save(KEY, null)
}

// ---------------------------------------------------------------- the steps of a round

export function reveal(b: BoardState): BoardState {
  return b.phase === 'ask' ? { ...b, phase: 'reveal', marked: [], buzz: null } : b
}

// ---------------------------------------------------------------- speed round

/** A team put its hand up first: it answers now (not a team already wrong on this question). */
export function buzzIn(b: BoardState, team: number): BoardState {
  if (!b.cfg.speed || b.phase !== 'ask' || b.buzz != null || team < 0 || team >= b.cfg.teams.length || (b.out ?? []).includes(team)) return b
  return { ...b, buzz: team }
}

/** The answering team was right: show the answer with that team ticked, ready to dig. */
export function buzzRight(b: BoardState): BoardState {
  if (b.phase !== 'ask' || b.buzz == null) return b
  return { ...b, phase: 'reveal', marked: [b.buzz], buzz: null }
}

/** The answering team was wrong: it is out for this question and the others can put their hands up. */
export function buzzWrong(b: BoardState): BoardState {
  if (b.phase !== 'ask' || b.buzz == null) return b
  return { ...b, out: [...(b.out ?? []), b.buzz], buzz: null }
}

/** every team has had a wrong answer on this question */
export const allOut = (b: BoardState) => (b.out ?? []).length >= b.cfg.teams.length

export function toggleTeam(b: BoardState, team: number): BoardState {
  if (b.phase !== 'reveal' || team < 0 || team >= b.cfg.teams.length) return b
  return { ...b, marked: b.marked.includes(team) ? b.marked.filter((t) => t !== team) : [...b.marked, team].sort((x, y) => x - y) }
}

export function markAll(b: BoardState, all: boolean): BoardState {
  return b.phase === 'reveal' ? { ...b, marked: all ? b.cfg.teams.map((_, i) => i) : [] } : b
}

/** Every ticked team digs. */
export function digRound(b: BoardState, rng: () => number = Math.random): BoardState {
  if (b.phase !== 'reveal') return b
  const r = dig(b.scores, b.marked, rng)
  return { ...b, phase: 'dug', scores: r.scores, rounds: [...b.rounds, { right: b.marked, finds: r.finds, before: b.scores }], marked: [] }
}

/** Back to ticking the teams for this question, with the totals as they were. */
export function undoDig(b: BoardState): BoardState {
  if (b.phase !== 'dug' || b.rounds.length === 0) return b
  const last = b.rounds[b.rounds.length - 1]
  return { ...b, phase: 'reveal', scores: last.before, rounds: b.rounds.slice(0, -1), marked: last.right }
}

export function nextQuestion(b: BoardState, total: number): BoardState {
  if (b.phase !== 'dug') return b
  return b.i + 1 >= total ? { ...b, phase: 'done' } : { ...b, i: b.i + 1, phase: 'ask', marked: [], buzz: null, out: [] }
}

/** The totals while a round's finds are being shown one at a time: `shown` finds have happened so far. */
export function scoresDuring(round: Round, shown: number): number[] {
  const s = round.before.slice()
  for (const f of round.finds.slice(0, shown)) {
    if (f.other !== undefined) s[f.other] = f.kind === 'leapfrog' ? f.before : s[f.other] - (f.otherLoss ?? 0)
    s[f.team] = f.after
  }
  return s
}
