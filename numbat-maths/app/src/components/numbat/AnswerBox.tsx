// The answer area under a question: a text box with a helper keypad, or multiple-choice buttons.
import { useEffect, useRef } from 'react'
import type { Answer, Question } from '@/lib/maths/types'
import { MathHtml } from './MathHtml'
import { cn } from '@/lib/utils'

type Key = { label: string; insert: string; title?: string }

const MINUS: Key = { label: '−', insert: '-', title: 'minus / negative' }
const SLASH: Key = { label: '/', insert: '/', title: 'fraction bar' }
const DOT: Key = { label: '.', insert: '.', title: 'decimal point' }
const POWER: Key = { label: 'xⁿ', insert: '^', title: 'power, e.g. x^2' }

function exprLetters(expr: string): string[] {
  const letters = Array.from(new Set(expr.replace(/sqrt|pi/g, '').match(/[a-zA-Z]/g) ?? []))
  return letters.slice(0, 3)
}

function keysFor(a: Answer): Key[] {
  switch (a.kind) {
    case 'num':
      return [MINUS, DOT, SLASH]
    case 'frac':
      return a.mixed ? [SLASH, { label: 'space', insert: ' ', title: 'space between whole number and fraction' }, MINUS] : [SLASH, MINUS, DOT]
    case 'nums':
      return [{ label: '±', insert: '±' }, { label: ',', insert: ', ' }, MINUS, DOT]
    case 'point':
      return [{ label: '(', insert: '(' }, { label: ',', insert: ', ' }, { label: ')', insert: ')' }, MINUS]
    case 'ratio':
      return [{ label: ':', insert: ' : ' }]
    case 'sci':
      return [{ label: '× 10ⁿ', insert: ' × 10^' }, MINUS, DOT]
    case 'primefactors':
      return [{ label: '×', insert: ' × ' }, POWER]
    case 'expr':
      return [...exprLetters(a.expr).map((l) => ({ label: l, insert: l })), POWER, { label: '(', insert: '(' }, { label: ')', insert: ')' }, SLASH, MINUS]
    default:
      return []
  }
}

function placeholderFor(a: Answer): string {
  switch (a.kind) {
    case 'num':
      return a.dp !== undefined ? `${a.dp} decimal place${a.dp === 1 ? '' : 's'}` : 'Type your answer'
    case 'frac':
      return a.mixed ? 'e.g. 2 1/3' : 'e.g. 3/4'
    case 'nums':
      return 'e.g. 5, −5'
    case 'point':
      return '(x, y)'
    case 'ratio':
      return 'e.g. 2 : 3'
    case 'sci':
      return 'e.g. 3.2 × 10^5'
    case 'primefactors':
      return 'e.g. 2^3 × 5'
    case 'expr':
      return 'Type your answer'
    default:
      return 'Type your answer'
  }
}

function helpFor(a: Answer): string | null {
  switch (a.kind) {
    case 'frac':
      return a.mixed ? 'Type a mixed number with a space, e.g. 2 1/3.' : 'Type fractions with a slash, e.g. 3/4.'
    case 'nums':
      return 'Type every answer, separated by commas.'
    case 'sci':
      return 'Type powers of ten with ^, e.g. 4.5 × 10^-3 (you can type x or * for ×).'
    case 'primefactors':
      return 'Use ^ for powers, e.g. 2^3 × 3^2.'
    case 'expr':
      return 'Use ^ for powers (x^2) and / for fractions.'
    default:
      return null
  }
}

export type BoxState = 'idle' | 'right' | 'wrong'

export function AnswerBox({
  q,
  value,
  onChange,
  onEnter,
  state = 'idle',
  locked = false,
  wrongOptions = [],
  showCorrectOption = false,
  autoFocus = true,
}: {
  q: Question
  value: string
  onChange: (v: string) => void
  onEnter: () => void
  state?: BoxState
  locked?: boolean
  wrongOptions?: number[]
  showCorrectOption?: boolean
  autoFocus?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const a = q.answer

  useEffect(() => {
    if (autoFocus && !locked && inputRef.current && window.matchMedia('(pointer: fine)').matches) {
      inputRef.current.focus({ preventScroll: true })
    }
  }, [q, autoFocus, locked])

  if (a.kind === 'mc') {
    const long = a.options.some((o) => o.replace(/<[^>]*>/g, '').length > 28)
    return (
      <div className={cn('mc-options', !long && 'cols-2')} role="radiogroup" aria-label="Choose an answer">
        {a.options.map((opt, i) => {
          const selected = value === String(i)
          const isWrong = wrongOptions.includes(i)
          const isRight = showCorrectOption && i === a.correct
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={locked || isWrong}
              className={cn('mc-option', selected && !isWrong && 'selected', isWrong && 'wrong', isRight && 'right', state === 'right' && selected && 'right')}
              onClick={() => onChange(String(i))}
              onDoubleClick={() => {
                onChange(String(i))
                onEnter()
              }}
            >
              <span className="letter" aria-hidden="true">
                {String.fromCharCode(65 + i)}
              </span>
              <MathHtml inline html={opt} />
            </button>
          )
        })}
      </div>
    )
  }

  const keys = keysFor(a)
  const help = helpFor(a)

  const insert = (text: string) => {
    const el = inputRef.current
    if (!el || locked) return
    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length
    const next = value.slice(0, start) + text + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + text.length
      el.setSelectionRange(pos, pos)
    })
  }

  return (
    <div className="grid gap-2">
      <div className="answer-row">
        {q.prefix && <MathHtml inline className="affix" html={q.prefix} />}
        <input
          ref={inputRef}
          className={cn('field answer-input', state === 'right' && 'is-right', state === 'wrong' && 'is-wrong')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onEnter()
            }
          }}
          readOnly={locked}
          placeholder={placeholderFor(a)}
          aria-label="Your answer"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          inputMode="text"
          enterKeyHint="done"
        />
        {q.suffix && <MathHtml inline className="affix" html={q.suffix} />}
      </div>
      {!locked && keys.length > 0 && (
        <div className="keypad" aria-label="Maths symbols">
          {keys.map((k) => (
            <button key={k.label} type="button" title={k.title} onMouseDown={(e) => e.preventDefault()} onClick={() => insert(k.insert)}>
              {k.label}
            </button>
          ))}
        </div>
      )}
      {!locked && help && <p className="text-sm text-muted-foreground">{help}</p>}
    </div>
  )
}
