// "A class game is in progress": shown on the home page and the games page, so a game interrupted by a
// page refresh (or a laptop going to sleep) is one tap away.
import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Play } from 'lucide-react'
import { findGame, gameTitle } from '@/content/games'
import { type BoardState, loadBoard } from '@/lib/board'

export function GameResume() {
  const [saved, setSaved] = useState<BoardState | null>(null)
  useEffect(() => setSaved(loadBoard()), [])
  const found = saved ? findGame(saved.cfg.game) : undefined
  if (!saved || !found) return null
  return (
    <section className="panel grid gap-3 border-primary/40 p-4 sm:grid-cols-[1fr_auto] sm:items-center" aria-label="Class game in progress">
      <div>
        <h2 className="font-display text-lg font-semibold">A class game is in progress</h2>
        <p className="text-sm text-muted-foreground">
          {gameTitle(found)} · question {saved.i + 1} of {saved.cfg.count} · {saved.cfg.teams.join(', ')}
        </p>
      </div>
      <Link to="/game" search={{ id: saved.cfg.game }} className="btn btn-primary">
        <Play size={18} aria-hidden="true" /> Carry on
      </Link>
    </section>
  )
}
