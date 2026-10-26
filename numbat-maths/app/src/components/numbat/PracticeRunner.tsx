// A practice set: questions one at a time, two tries each, hints and worked solutions.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Check, Lightbulb, RotateCcw, Star, X } from 'lucide-react'
import type { Level, Skill } from '@/lib/maths/types'
import { checkAnswer } from '@/lib/maths/check'
import { buildSet } from '@/lib/practice'
import { fullAnswerHtml } from '@/lib/answer'
import { useSaveResult, type SaveResult } from '@/lib/progress'
import { useSession } from '@/lib/session'
import { cn } from '@/lib/utils'
import { AnswerBox } from './AnswerBox'
import { Diagram, MathHtml } from './MathHtml'
import { LevelPill, QuestionCard, Steps } from './QuestionCard'

interface ItemState {
  tries: number
  credit: number | null // null while the question is still open
  revealed: boolean
  hint: boolean
  wrong: number[] // multiple-choice options already tried
  given: string
}

const PRAISE = ['Correct!', 'Spot on!', 'Nice work!', 'That’s right!', 'Excellent!', 'Well done!']

export function dotClass(credit: number | null, current: boolean): string {
  if (credit === 1) return 'full'
  if (credit === 0.5) return 'half'
  if (credit === 0) return 'zero'
  return current ? 'cur' : ''
}

export function PracticeRunner({
  skill,
  levels,
  itemId,
  onExit,
  onAgain,
  nextSkill,
  topicId,
}: {
  skill: Skill
  levels: Level[]
  itemId: string | null // null: extra practice that is not saved
  onExit: () => void
  onAgain: () => void
  nextSkill?: Skill
  topicId: string
}) {
  const set = useMemo(() => buildSet(skill, levels), [skill, levels])
  const n = set.length
  const [i, setI] = useState(0)
  const [states, setStates] = useState<ItemState[]>(() => set.map(() => ({ tries: 0, credit: null, revealed: false, hint: false, wrong: [], given: '' })))
  const [value, setValue] = useState('')
  const [wrongValue, setWrongValue] = useState<string | null>(null)
  const [fb, setFb] = useState<{ tone: 'good' | 'bad' | 'info'; text: string } | null>(null)
  const [working, setWorking] = useState(false)
  const [result, setResult] = useState<(SaveResult & { correct: number }) | null>(null)
  const [saving, setSaving] = useState(false)
  const save = useSaveResult()

  const cur = set[i]
  const st = states[i]
  const open = st.credit === null

  const update = (patch: Partial<ItemState>) => setStates((all) => all.map((s, k) => (k === i ? { ...s, ...patch } : s)))

  const finish = useCallback(async () => {
    const correct = states.reduce((t, s) => t + (s.credit ?? 0), 0)
    if (itemId) {
      setSaving(true)
      const r = await save(itemId, 'practice', correct, n)
      setSaving(false)
      setResult({ ...r, correct })
    } else {
      const score = Math.round((correct / n) * 100)
      setResult({ saved: false, score, points: 0, best: score, newBest: false, correct })
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [states, itemId, n, save])

  const next = () => {
    if (i + 1 >= n) {
      void finish()
      return
    }
    setI(i + 1)
    setValue('')
    setWrongValue(null)
    setFb(null)
    setWorking(false)
  }

  const check = () => {
    if (!open) {
      next()
      return
    }
    const r = checkAnswer(cur.q.answer, value)
    if (r.invalid) {
      setFb({ tone: 'info', text: r.feedback ?? 'We couldn’t read that answer. Check how you typed it.' })
      return
    }
    if (r.correct) {
      const credit = st.tries === 0 ? 1 : 0.5
      update({ credit, given: value })
      const text = st.tries === 0 ? PRAISE[Math.floor(Math.random() * PRAISE.length)] : 'Correct on your second try: half a mark.'
      setFb({ tone: 'good', text: r.feedback ? `${text} ${r.feedback}` : text })
      return
    }
    const tries = st.tries + 1
    const wrong = cur.q.answer.kind === 'mc' ? [...st.wrong, Number(value)] : st.wrong
    if (tries >= 2) {
      update({ tries, credit: 0, revealed: true, wrong, given: value })
      setFb({ tone: 'bad', text: 'Not this time. Here’s how to do it.' })
      setWorking(true)
    } else {
      update({ tries, wrong, hint: true })
      setWrongValue(value)
      if (cur.q.answer.kind === 'mc') setValue('')
      setFb({ tone: 'bad', text: r.feedback ?? 'Not quite. Read the hint, then have another go.' })
    }
  }

  const showMe = () => {
    update({ credit: 0, revealed: true, given: value })
    setFb({ tone: 'info', text: 'No worries. Read through the steps, then try the next one.' })
    setWorking(true)
  }

  // Enter moves on for multiple choice (the text box handles its own Enter key)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || result) return
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, button, a, select')) return
      if (cur.q.answer.kind === 'mc' && (value !== '' || !open)) check()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (result) {
    return (
      <PracticeResults
        result={result}
        total={n}
        states={states}
        set={set}
        saved={!!itemId}
        onAgain={onAgain}
        nextSkill={nextSkill}
        topicId={topicId}
      />
    )
  }

  const boxState = !open ? (st.credit && st.credit > 0 ? 'right' : 'wrong') : wrongValue !== null && value === wrongValue ? 'wrong' : 'idle'

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="progress-dots" aria-label={`Question ${i + 1} of ${n}`}>
          {states.map((s, k) => (
            <span key={k} className={dotClass(s.credit, k === i)} />
          ))}
        </div>
        <span className="text-sm font-bold text-muted-foreground">
          Score {states.reduce((t, s) => t + (s.credit ?? 0), 0)} / {n}
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-sm ml-auto"
          onClick={() => {
            if (i === 0 && open) onExit()
            else if (window.confirm('Stop this practice set? Your answers so far will not be saved.')) onExit()
          }}
        >
          <X size={16} aria-hidden="true" /> Stop
        </button>
      </div>

      <QuestionCard q={cur.q} level={cur.level} number={i + 1} total={n}>
        <AnswerBox
          key={i}
          q={cur.q}
          value={value}
          onChange={(v) => {
            setValue(v)
            if (fb?.tone === 'info') setFb(null)
          }}
          onEnter={check}
          state={boxState}
          locked={!open}
          wrongOptions={st.wrong}
          showCorrectOption={st.revealed}
        />

        {st.hint && open && (
          <div className="hint-box">
            <strong>Hint: </strong>
            <MathHtml inline html={cur.q.hint} />
          </div>
        )}

        {fb && (
          <div className={cn('feedback', fb.tone, fb.tone === 'good' && 'celebrate')} role="status" aria-live="polite">
            {fb.text}
          </div>
        )}

        {!open && (st.revealed || (st.credit ?? 0) < 1) && (
          <div className="feedback info">
            The answer is <MathHtml inline html={fullAnswerHtml(cur.q)} />
          </div>
        )}

        {!open && working && (
          <div className="grid gap-2">
            <h3 className="font-display font-semibold">Worked solution</h3>
            <Steps steps={cur.q.steps} />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {open ? (
            <>
              <button type="button" className="btn btn-primary btn-lg" onClick={check} disabled={value.trim() === ''}>
                <Check size={18} aria-hidden="true" /> Check
              </button>
              {!st.hint && (
                <button type="button" className="btn btn-ghost" onClick={() => update({ hint: true })}>
                  <Lightbulb size={18} aria-hidden="true" /> Hint
                </button>
              )}
              <button type="button" className="btn btn-ghost" onClick={showMe}>
                Show me how
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-primary btn-lg" onClick={next} disabled={saving} autoFocus>
                {i + 1 >= n ? 'See my results' : 'Next question'} <ArrowRight size={18} aria-hidden="true" />
              </button>
              {!working && (
                <button type="button" className="btn btn-ghost" onClick={() => setWorking(true)}>
                  See the working
                </button>
              )}
            </>
          )}
        </div>
      </QuestionCard>
    </div>
  )
}

function PracticeResults({
  result,
  total,
  states,
  set,
  saved,
  onAgain,
  nextSkill,
  topicId,
}: {
  result: SaveResult & { correct: number }
  total: number
  states: ItemState[]
  set: ReturnType<typeof buildSet>
  saved: boolean
  onAgain: () => void
  nextSkill?: Skill
  topicId: string
}) {
  const { student } = useSession()
  const pct = result.score
  const mastered = pct >= 80
  const heading = mastered ? 'Skill mastered!' : pct >= 50 ? 'Getting there!' : 'Keep practising'
  const message = mastered
    ? 'Great work. Try the next skill, or the topic test when you’ve mastered a few.'
    : pct >= 50
      ? 'You’re close. Another set should get you to 80%.'
      : 'Have another look at the Learn tab and its worked examples, then try again.'

  return (
    <div className="grid gap-5">
      <section className="q-card grid gap-4 text-center">
        <p className={cn('font-display text-5xl font-semibold', mastered ? 'text-success' : 'text-foreground')}>
          {result.correct} <span className="text-muted-foreground">/ {total}</span>
        </p>
        <h2 className="font-display text-2xl font-semibold">{heading}</h2>
        <p className="text-muted-foreground">{message}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="chip">{pct}%</span>
          {saved && student && result.saved && result.points > 0 && (
            <span className="points-pill celebrate">
              <Star size={16} fill="currentColor" aria-hidden="true" /> +{result.points} points
            </span>
          )}
          {saved && result.saved && result.newBest && <span className="m-badge m-mastered">New best</span>}
        </div>
        {saved && !result.saved && result.message && <p className="feedback info text-sm">{result.message}</p>}
        {!saved && <p className="text-sm text-muted-foreground">Extra practice is not saved to your results.</p>}
        {saved && result.saved && !student && <p className="text-sm text-muted-foreground">Saved on this device only. Log in with a class code to keep your progress everywhere.</p>}
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" className="btn btn-primary btn-lg" onClick={onAgain}>
            <RotateCcw size={18} aria-hidden="true" /> Practise again
          </button>
          {nextSkill && (
            <Link to="/lesson" search={{ id: nextSkill.id, tab: 'learn' }} className="btn btn-soft btn-lg">
              Next skill <ArrowRight size={18} aria-hidden="true" />
            </Link>
          )}
          <Link to="/topic" search={{ id: topicId }} className="btn btn-ghost btn-lg">
            Back to topic
          </Link>
        </div>
      </section>

      <section className="panel p-4 sm:p-5">
        <h3 className="font-display mb-3 text-lg font-semibold">Your answers</h3>
        <ol className="grid gap-3">
          {set.map((p, k) => {
            const s = states[k]
            const mark = s.credit ?? 0
            return (
              <li key={k} className="grid gap-2 border-b border-border pb-3 last:border-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn('m-badge', mark === 1 ? 'm-mastered' : mark === 0.5 ? 'm-getting' : 'm-practise')}>
                    {mark === 1 ? <Check size={14} aria-hidden="true" /> : mark === 0.5 ? '½' : <X size={14} aria-hidden="true" />}
                    Q{k + 1}
                  </span>
                  <LevelPill level={p.level} />
                </div>
                <MathHtml html={p.q.prompt} className="text-sm" />
                <p className="text-sm">
                  <span className="text-muted-foreground">Answer: </span>
                  <MathHtml inline html={fullAnswerHtml(p.q)} />
                </p>
                <details className="text-sm">
                  <summary className="cursor-pointer font-bold text-primary">Worked solution</summary>
                  <div className="mt-2 grid gap-2">
                    <Diagram svg={p.q.diagram} note={p.q.note} />
                    <Steps steps={p.q.steps} />
                  </div>
                </details>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
