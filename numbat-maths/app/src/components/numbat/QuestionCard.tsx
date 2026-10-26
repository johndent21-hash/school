import { Calculator, Volume2 } from 'lucide-react'
import { useState } from 'react'
import type { Level, Question } from '@/lib/maths/types'
import { LEVEL_NAMES } from '@/lib/maths/types'
import { canSpeak, speak, stopSpeaking } from '@/lib/speech'
import { useMounted } from '@/lib/use-mounted'
import { Diagram, MathHtml } from './MathHtml'

export function LevelPill({ level }: { level: Level }) {
  return <span className={`level-pill level-${level}`}>{LEVEL_NAMES[level]}</span>
}

export function ReadAloud({ html, label = 'Read aloud' }: { html: string; label?: string }) {
  const mounted = useMounted()
  const [speaking, setSpeaking] = useState(false)
  if (!mounted || !canSpeak()) return null
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      aria-pressed={speaking}
      onClick={() => {
        if (speaking) {
          stopSpeaking()
          setSpeaking(false)
          return
        }
        if (speak(html, () => setSpeaking(false))) setSpeaking(true)
      }}
    >
      <Volume2 size={16} aria-hidden="true" />
      {speaking ? 'Stop' : label}
    </button>
  )
}

/** The question itself: level, calculator note, prompt and diagram. The answer area goes in children. */
export function QuestionCard({
  q,
  level,
  number,
  total,
  children,
}: {
  q: Question
  level: Level
  number?: number
  total?: number
  children?: React.ReactNode
}) {
  return (
    <section className="q-card grid gap-4" aria-label={number ? `Question ${number}` : 'Question'}>
      <div className="flex flex-wrap items-center gap-2">
        {number !== undefined && (
          <span className="font-display text-lg font-semibold">
            Question {number}
            {total ? <span className="text-muted-foreground"> of {total}</span> : null}
          </span>
        )}
        <LevelPill level={level} />
        {q.calc && (
          <span className="chip" title="You may use a calculator for this question">
            <Calculator size={13} aria-hidden="true" /> Calculator allowed
          </span>
        )}
        <span className="ml-auto">
          <ReadAloud html={q.prompt} label="Read" />
        </span>
      </div>
      <MathHtml className="q-prompt" html={q.prompt} />
      <Diagram svg={q.diagram} note={q.note} />
      {children}
    </section>
  )
}

/** Numbered worked-solution steps. */
export function Steps({ steps, upTo, animate = false }: { steps: string[]; upTo?: number; animate?: boolean }) {
  const shown = upTo === undefined ? steps : steps.slice(0, upTo)
  return (
    <ol className="steps">
      {shown.map((s, i) => (
        <li key={i} className={animate && i === shown.length - 1 ? 'step-enter' : undefined}>
          <MathHtml html={s} />
        </li>
      ))}
    </ol>
  )
}
