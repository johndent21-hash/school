// A topic test: ten questions, one try each, marked at the end with a full review.
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Check, Flag, RotateCcw, Star, X } from 'lucide-react'
import type { Topic } from '@/lib/maths/types'
import { checkAnswer } from '@/lib/maths/check'
import { buildTest, testItemId } from '@/lib/practice'
import { answerHtml, fullAnswerHtml } from '@/lib/answer'
import { useRewards, useSaveResult, type SaveResult } from '@/lib/progress'
import type { RewardSummary } from '@/lib/rewards'
import { useSession } from '@/lib/session'
import { cn } from '@/lib/utils'
import { AnswerBox } from './AnswerBox'
import { ConfirmBar } from './ConfirmBar'
import { Diagram, MathHtml } from './MathHtml'
import { LevelPill, QuestionCard, Steps } from './QuestionCard'
import { RewardsCelebration } from './Rewards'

export function TestRunner({ topic, onExit, onAgain }: { topic: Topic; onExit: () => void; onAgain: () => void }) {
  const set = useMemo(() => buildTest(topic), [topic])
  const n = set.length
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState<string[]>(() => set.map(() => ''))
  const [warned, setWarned] = useState<string | null>(null)
  const [marks, setMarks] = useState<boolean[] | null>(null)
  const [result, setResult] = useState<SaveResult | null>(null)
  const [saving, setSaving] = useState(false)
  const [ask, setAsk] = useState<null | 'leave' | 'finish'>(null)
  const save = useSaveResult()
  const rewards = useRewards()
  const before = useRef<RewardSummary | null>(null)
  if (before.current === null && !rewards.loading) before.current = rewards.summary

  const value = answers[i]
  const setValue = (v: string) => {
    setAnswers((a) => a.map((x, k) => (k === i ? v : x)))
    setWarned(null)
  }

  const go = (k: number) => {
    setI(k)
    setWarned(null)
    setAsk(null)
  }

  const submit = async () => {
    const m = set.map((p, k) => {
      const r = checkAnswer(p.q.answer, answers[k])
      return r.correct && !r.invalid
    })
    const correct = m.filter(Boolean).length
    setSaving(true)
    const r = await save(testItemId(topic.id), 'test', correct, n)
    setSaving(false)
    setMarks(m)
    setResult(r)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const next = () => {
    const p = set[i]
    const key = `${i}|${value}`
    if (warned !== key) {
      if (value.trim() === '') {
        setWarned(key)
        return
      }
      const r = checkAnswer(p.q.answer, value)
      if (r.invalid) {
        setWarned(key)
        return
      }
    }
    if (i + 1 < n) go(i + 1)
    else {
      if (answers.some((a) => a.trim() === '')) setAsk('finish')
      else void submit()
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || marks) return
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, button, a, select')) return
      if (set[i].q.answer.kind === 'mc' && answers[i] !== '') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (marks && result)
    return <TestResults topic={topic} set={set} answers={answers} marks={marks} result={result} onAgain={onAgain} rewardsBefore={before.current} rewardsAfter={rewards.summary} />

  const p = set[i]
  const blank = answers.filter((a) => a.trim() === '').length
  const warning =
    warned === `${i}|${value}`
      ? value.trim() === ''
        ? 'You haven’t answered this one. Press Next again to skip it.'
        : 'Check your answer is written the way the question asks (for example simplified, rounded, or as a fraction). Press Next again to keep it as it is.'
      : null

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="progress-dots" aria-label={`Question ${i + 1} of ${n}`}>
          {answers.map((a, k) => (
            <button
              key={k}
              type="button"
              aria-label={`Go to question ${k + 1}${a.trim() ? ' (answered)' : ''}`}
              onClick={() => go(k)}
              className={cn('h-[0.45rem] w-[1.6rem] rounded-full border-0 p-0', k === i ? 'bg-primary' : a.trim() ? 'bg-primary/40' : 'bg-muted')}
            />
          ))}
        </div>
        <span className="text-sm font-bold text-muted-foreground">{answers.filter((a) => a.trim()).length} answered</span>
        <button
          type="button"
          className="btn btn-ghost btn-sm ml-auto"
          onClick={() => setAsk('leave')}
        >
          <X size={16} aria-hidden="true" /> Leave test
        </button>
      </div>
      {ask === 'leave' && (
        <ConfirmBar message="Leave this test? Your answers won’t be saved." confirmLabel="Leave test" cancelLabel="Keep going" onConfirm={onExit} onCancel={() => setAsk(null)} danger />
      )}

      <QuestionCard q={p.q} level={p.level} number={i + 1} total={n}>
        <AnswerBox key={i} q={p.q} value={value} onChange={setValue} onEnter={next} year={topic.year} enterLabel={i + 1 < n ? 'Next' : 'Finish'} />
        {warning && (
          <div className="feedback info" role="status">
            {warning}
          </div>
        )}
        {ask === 'finish' && (
          <ConfirmBar
            message={`You have ${blank} unanswered question${blank === 1 ? '' : 's'}. Finish the test anyway?`}
            confirmLabel="Finish test"
            cancelLabel="Go back"
            onConfirm={() => {
              setAsk(null)
              void submit()
            }}
            onCancel={() => setAsk(null)}
          />
        )}
        <div className="flex flex-wrap items-center gap-2">
          {i > 0 && (
            <button type="button" className="btn btn-ghost" onClick={() => go(i - 1)}>
              <ArrowLeft size={18} aria-hidden="true" /> Back
            </button>
          )}
          <button type="button" className="btn btn-primary btn-lg" onClick={next} disabled={saving}>
            {i + 1 < n ? (
              <>
                Next <ArrowRight size={18} aria-hidden="true" />
              </>
            ) : (
              <>
                <Flag size={18} aria-hidden="true" /> Finish test
              </>
            )}
          </button>
        </div>
      </QuestionCard>
      <p className="text-sm text-muted-foreground">One try at each question. You can go back and change answers until you press Finish test.</p>
    </div>
  )
}

function TestResults({
  topic,
  set,
  answers,
  marks,
  result,
  onAgain,
  rewardsBefore,
  rewardsAfter,
}: {
  topic: Topic
  set: ReturnType<typeof buildTest>
  answers: string[]
  marks: boolean[]
  result: SaveResult
  onAgain: () => void
  rewardsBefore: RewardSummary | null
  rewardsAfter: RewardSummary
}) {
  const { student, teacher } = useSession()
  const correct = marks.filter(Boolean).length
  const pct = Math.round((correct / set.length) * 100)
  const weak = Array.from(new Set(set.filter((_, k) => !marks[k]).map((p) => p.skill)))

  return (
    <div className="grid gap-5">
      <section className="q-card grid gap-3 text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{topic.title}: topic test</p>
        <p className={cn('font-display text-5xl font-semibold', pct >= 80 ? 'text-success' : 'text-foreground')}>
          {correct} <span className="text-muted-foreground">/ {set.length}</span>
        </p>
        <h2 className="font-display text-2xl font-semibold">{pct >= 80 ? 'Excellent result!' : pct >= 50 ? 'Solid effort!' : 'Good try. Let’s build on it.'}</h2>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="chip">{pct}%</span>
          {result.saved && result.points > 0 && (
            <span className="points-pill celebrate">
              <Star size={16} fill="currentColor" aria-hidden="true" /> +{result.points} points
            </span>
          )}
          {result.saved && result.newBest && <span className="m-badge m-mastered">New best</span>}
        </div>
        {!result.saved && result.message && <p className="feedback info text-sm">{result.message}</p>}
        {result.saved && !student && !teacher && <p className="text-sm text-muted-foreground">Saved on this device only.</p>}
        {result.saved && <RewardsCelebration before={rewardsBefore} after={rewardsAfter} />}
        {weak.length > 0 && (
          <div className="mx-auto grid max-w-lg gap-2 text-left">
            <p className="font-bold">Skills to practise next:</p>
            <div className="flex flex-wrap gap-2">
              {weak.map((s) => (
                <Link key={s.id} to="/lesson" search={{ id: s.id, tab: 'practice' }} className="btn btn-soft btn-sm">
                  {s.title}
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <button type="button" className="btn btn-primary btn-lg" onClick={onAgain}>
            <RotateCcw size={18} aria-hidden="true" /> New test
          </button>
          <Link to="/topic" search={{ id: topic.id }} className="btn btn-ghost btn-lg">
            Back to topic
          </Link>
        </div>
      </section>

      <section className="panel p-4 sm:p-5">
        <h3 className="font-display mb-3 text-lg font-semibold">Review your answers</h3>
        <ol className="grid gap-4">
          {set.map((p, k) => (
            <li key={k} className="grid gap-2 border-b border-border pb-4 last:border-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn('m-badge', marks[k] ? 'm-mastered' : 'm-practise')}>
                  {marks[k] ? <Check size={14} aria-hidden="true" /> : <X size={14} aria-hidden="true" />} Q{k + 1}
                </span>
                <LevelPill level={p.level} />
                <span className="text-sm text-muted-foreground">{p.skill.title}</span>
              </div>
              <MathHtml html={p.q.prompt} />
              <Diagram svg={p.q.diagram} note={p.q.note} />
              <div className="grid gap-1 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-muted-foreground">Your answer: </span>
                  {answers[k].trim() === '' ? (
                    <em>no answer</em>
                  ) : p.q.answer.kind === 'mc' ? (
                    <MathHtml inline html={p.q.answer.options[Number(answers[k])] ?? ''} />
                  ) : (
                    <strong>{answers[k]}</strong>
                  )}
                </p>
                <p>
                  <span className="text-muted-foreground">Correct answer: </span>
                  <MathHtml inline html={p.q.answer.kind === 'mc' ? answerHtml(p.q.answer) : fullAnswerHtml(p.q)} />
                </p>
              </div>
              <details className="text-sm" open={!marks[k]}>
                <summary className="cursor-pointer font-bold text-primary">Worked solution</summary>
                <div className="mt-2">
                  <Steps steps={p.q.steps} />
                </div>
              </details>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
