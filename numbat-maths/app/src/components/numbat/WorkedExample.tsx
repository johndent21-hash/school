// Step-by-step worked examples: the site's version of a lesson video.
import { useEffect, useState } from 'react'
import { ChevronRight, ListChecks, RefreshCw } from 'lucide-react'
import type { Level, Skill } from '@/lib/maths/types'
import { LEVEL_NAMES } from '@/lib/maths/types'
import { fullAnswerHtml } from '@/lib/answer'
import { buildSet, type Posed } from '@/lib/practice'
import { Diagram, MathHtml } from './MathHtml'
import { LevelPill, ReadAloud, Steps } from './QuestionCard'

export function WorkedExample({ skill }: { skill: Skill }) {
  const [level, setLevel] = useState<Level>(1)
  const [ex, setEx] = useState<Posed | null>(null)
  const [shown, setShown] = useState(0)

  const fresh = (l: Level) => {
    setEx(buildSet(skill, [l])[0])
    setShown(0)
  }

  useEffect(() => {
    fresh(level)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill.id, level])

  if (!ex) return <div className="skel h-48" />
  const { q } = ex
  const total = q.steps.length
  const done = shown >= total

  return (
    <section className="q-card grid gap-4" aria-label="Worked example">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-display text-lg font-semibold">Worked example</h3>
        <LevelPill level={level} />
        <div className="tabs ml-auto" role="tablist" aria-label="Example difficulty">
          {([1, 2, 3] as Level[]).map((l) => (
            <button key={l} type="button" role="tab" aria-selected={l === level} className={l === level ? 'active' : ''} onClick={() => setLevel(l)}>
              {LEVEL_NAMES[l]}
            </button>
          ))}
        </div>
      </div>

      <MathHtml className="q-prompt" html={q.prompt} />
      <Diagram svg={q.diagram} note={q.note} />

      {shown > 0 && <Steps steps={q.steps} upTo={shown} animate />}

      {done && (
        <div className="feedback good celebrate">
          Answer: <MathHtml inline html={fullAnswerHtml(q)} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {!done && (
          <button type="button" className="btn btn-primary" onClick={() => setShown((s) => s + 1)}>
            {shown === 0 ? 'Show the first step' : 'Next step'} <ChevronRight size={18} aria-hidden="true" />
          </button>
        )}
        {!done && total > 1 && (
          <button type="button" className="btn btn-ghost" onClick={() => setShown(total)}>
            <ListChecks size={18} aria-hidden="true" /> Show all steps
          </button>
        )}
        <button type="button" className="btn btn-soft" onClick={() => fresh(level)}>
          <RefreshCw size={16} aria-hidden="true" /> New example
        </button>
        {shown > 0 && <ReadAloud html={q.steps.slice(0, shown).join(' . ')} label="Read steps aloud" />}
        {!done && (
          <span className="text-sm text-muted-foreground">
            Step {Math.min(shown, total)} of {total}
          </span>
        )}
      </div>
    </section>
  )
}
