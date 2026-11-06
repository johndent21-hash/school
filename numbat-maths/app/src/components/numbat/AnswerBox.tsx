// The answer area under a question: a text box with the maths keypad, or multiple-choice buttons.
import { useEffect, useRef, useState } from 'react'
import type { Answer, Question } from '@/lib/maths/types'
import { padLayout } from '@/lib/maths/keypad'
import { ex } from '@/lib/maths/format'
import { normalise, parse } from '@/lib/maths/expr'
import { MathHtml } from './MathHtml'
import { KeypadToggle, MathKeypad, useKeypad } from './MathKeypad'
import { Calculator, CalculatorToggle, useCalculatorOpen } from './Calculator'
import { cn } from '@/lib/utils'

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
    case 'time':
      return a.ampm ? 'e.g. 7:45 pm' : 'e.g. 3:45'
    case 'open':
      return a.rule.type === 'blanks' ? 'e.g. −3, 10' : 'Type the calculation'
    default:
      return 'Type your answer'
  }
}

function helpFor(a: Answer, stacked = false): string | null {
  if (a.kind === 'frac' && stacked)
    return a.mixed
      ? 'Type the whole number, then the top and bottom of the fraction (/ or ↓ moves down).'
      : 'Type the top number, then the bottom number (/ or ↓ moves down).'
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
      return 'Use ^ for powers (x^2) and / for fractions. The keypad has these keys.'
    case 'time':
      return a.ampm ? 'Type the time with a colon, then am or pm, e.g. 7:45 pm.' : 'Type the time with a colon, e.g. 3:45.'
    case 'open':
      return a.rule.type === 'blanks'
        ? 'Type the numbers for the blanks in order, separated by commas. There’s more than one right answer.'
        : a.rule.type === 'use'
          ? 'Type the whole calculation, using each number once. Put negative numbers in brackets, e.g. (−8).'
          : 'Type the whole calculation again with brackets added.'
    default:
      return null
  }
}

export type BoxState = 'idle' | 'right' | 'wrong'

/* ---------- fraction answers: a whole-number box, a top box and a bottom box ---------- */
type Field = 'w' | 'n' | 'd'
type FracFields = Record<Field, string>
/** "2 1/3" → whole 2, top 1, bottom 3; "3/4" → top 3, bottom 4; "5" → top 5 */
export function parseFrac(v: string): FracFields {
  const t = v.replace(/\s+/g, ' ').trim()
  let m = t.match(/^(\S+) (\S*) ?\/ ?(\S*)$/)
  if (m) return { w: m[1], n: m[2], d: m[3] }
  m = t.match(/^(\S*) ?\/ ?(\S*)$/)
  if (m) return { w: '', n: m[1], d: m[2] }
  m = t.match(/^(\S+) (\S+)$/)
  if (m) return { w: m[1], n: m[2], d: '' }
  return { w: '', n: t, d: '' }
}
/** the boxes as the answer text that is marked: "2 1/3", "3/4", "5" */
export function composeFrac(f: FracFields): string {
  if (!f.w && !f.n && !f.d) return ''
  if (!f.d) return f.w ? (f.n ? `${f.w} ${f.n}` : f.w) : f.n
  return f.w ? `${f.w} ${f.n}/${f.d}` : `${f.n}/${f.d}`
}
const FIELD_LABEL: Record<Field, string> = { w: 'Whole number', n: 'Top number (numerator)', d: 'Bottom number (denominator)' }

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
  year = 7,
  enterLabel = 'Check',
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
  /** Year level: Years 1–2 get bigger keys, and only secondary years get negative-number keys. */
  year?: number
  enterLabel?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const cursor = useRef<number | null>(null) // where to type when the box isn't focused
  const pad = useKeypad()
  const [calcOpen, setCalcOpen] = useCalculatorOpen()
  const a = q.answer
  const calc = q.calc && !locked
  // Years 7–9: fraction answers go in stacked boxes (top over bottom, and a whole number for mixed numerals)
  const stacked = a.kind === 'frac' && year >= 7
  const [fields, setFields] = useState<FracFields>(() => parseFrac(value))
  const [wantWhole, setWantWhole] = useState(false)
  const [active, setActive] = useState<Field>('n')
  const wRef = useRef<HTMLInputElement>(null)
  const nRef = useRef<HTMLInputElement>(null)
  const dRef = useRef<HTMLInputElement>(null)
  const refOf = (f: Field) => (f === 'w' ? wRef : f === 'n' ? nRef : dRef)
  const mixedAnswer = a.kind === 'frac' && !!a.mixed
  const improperOnly = a.kind === 'frac' && !!a.improper
  const wholeShown = stacked && (mixedAnswer || wantWhole || fields.w !== '')

  // a new question starts with empty boxes; an answer set from outside (the calculator, a saved place) fills them
  useEffect(() => setWantWhole(false), [q])
  useEffect(() => {
    if (stacked && value !== composeFrac(fields)) {
      const f = parseFrac(value)
      setFields(f)
      if (f.w) setWantWhole(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, stacked])

  useEffect(() => {
    const el = stacked ? (mixedAnswer ? wRef : nRef).current : inputRef.current
    if (autoFocus && !locked && el && !pad.touch) {
      el.focus({ preventScroll: true })
    }
  }, [q, autoFocus, locked, pad.touch, stacked, mixedAnswer])

  if (a.kind === 'mc') {
    const long = a.options.some((o) => o.replace(/<[^>]*>/g, '').length > 28)
    return (
      <div className="grid gap-3">
        {calc && (
          <div className="flex">
            <CalculatorToggle open={calcOpen} onToggle={() => setCalcOpen(!calcOpen)} />
          </div>
        )}
        {/* a slightly shorter calculator above choices, so the choices and the Check button still fit on screen */}
        {calc && calcOpen && <Calculator year={year} trig={q.calc === 'trig'} fractions={false} compact onClose={() => setCalcOpen(false)} />}
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
                className={cn(
                  'mc-option',
                  selected && !isWrong && 'selected',
                  isWrong && 'wrong',
                  isRight && 'right',
                  state === 'right' && selected && 'right',
                )}
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
      </div>
    )
  }

  const layout = padLayout(a, year, q.prompt)
  const help = helpFor(a, stacked)
  // on touch screens the keypad and the calculator take turns, so both fit on the screen
  const keypadOpen = pad.open && !locked && !(pad.touch && calc && calcOpen)

  const caret = (): [number, number] => {
    const el = inputRef.current
    if (el && document.activeElement === el) return [el.selectionStart ?? value.length, el.selectionEnd ?? value.length]
    const c = Math.min(cursor.current ?? value.length, value.length)
    return [c, c]
  }
  const place = (pos: number) => {
    cursor.current = pos
    const el = inputRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.focus({ preventScroll: true })
      el.setSelectionRange(pos, pos)
    })
  }
  const remember = () => {
    const el = inputRef.current
    if (el) cursor.current = el.selectionStart
  }

  const actions = {
    insert: (text: string) => {
      if (locked) return
      const [start, end] = caret()
      onChange(value.slice(0, start) + text + value.slice(end))
      place(start + text.length)
    },
    back: () => {
      if (locked) return
      const [start, end] = caret()
      if (start !== end) {
        onChange(value.slice(0, start) + value.slice(end))
        place(start)
      } else if (start > 0) {
        // keys like " : " and " am" type several characters; delete them in one press
        const multi = [...layout.extras, ...layout.symbols].map((k) => k.insert).filter((t) => t.length > 1 && value.slice(0, start).endsWith(t))
        const n = multi.length ? Math.max(...multi.map((t) => t.length)) : 1
        onChange(value.slice(0, start - n) + value.slice(start))
        place(start - n)
      }
    },
    move: (dir: -1 | 1) => place(Math.max(0, Math.min(value.length, caret()[0] + dir))),
    enter: onEnter,
    close: () => {
      pad.setOpen(false)
      // on a touch screen, closing the keypad brings up the device keyboard instead
      if (pad.touch) requestAnimationFrame(() => inputRef.current?.focus())
    },
  }

  /* ----- stacked fraction boxes ----- */
  const fieldOrder: Field[] = wholeShown ? ['w', 'n', 'd'] : ['n', 'd']
  const setField = (f: Field, text: string) => {
    const next = { ...fields, [f]: text }
    setFields(next)
    onChange(composeFrac(next))
  }
  const focusField = (f: Field, at?: number) => {
    setActive(f)
    // focus straight away, so the next key typed goes in the new box; place the caret once the value has updated
    refOf(f).current?.focus({ preventScroll: true })
    requestAnimationFrame(() => {
      const el = refOf(f).current
      if (!el) return
      if (document.activeElement !== el) el.focus({ preventScroll: true })
      const pos = Math.min(at ?? el.value.length, el.value.length)
      el.setSelectionRange(pos, pos)
    })
  }
  const fieldCaret = (): [number, number] => {
    const el = refOf(active).current
    const v = fields[active]
    if (el && document.activeElement === el) return [el.selectionStart ?? v.length, el.selectionEnd ?? v.length]
    return [v.length, v.length]
  }
  const typeIn = (f: Field, text: string) => {
    // a whole fraction typed or pasted into one box ("3/4", "2 1/3") is spread across the boxes
    if ((f === 'n' && /[/ ]/.test(text.trim())) || (f === 'w' && text.includes('/'))) {
      const p = parseFrac(text)
      setFields(p)
      if (p.w) setWantWhole(true)
      onChange(composeFrac(p))
      return
    }
    if (f === 'w' && text.endsWith(' ')) {
      setField('w', text.trim())
      return focusField('n')
    }
    setField(f, text.replace(/[^0-9.\-−]/g, ''))
  }
  const fieldKeys = (f: Field) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget
    const atStart = el.selectionStart === 0 && el.selectionEnd === 0
    const atEnd = el.selectionStart === el.value.length
    const go = (to: Field, at?: number) => {
      e.preventDefault()
      focusField(to, at)
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      return onEnter()
    }
    if (f === 'n' && (e.key === '/' || e.key === 'ArrowDown' || (e.key === 'ArrowRight' && atEnd))) return go('d')
    if (f === 'd' && (e.key === 'ArrowUp' || ((e.key === 'ArrowLeft' || e.key === 'Backspace') && atStart && el.value === '') || (e.key === 'ArrowLeft' && atStart))) return go('n')
    if (f === 'n' && wholeShown && ((e.key === 'Backspace' && el.value === '') || (e.key === 'ArrowLeft' && atStart))) return go('w')
    if (f === 'w' && (e.key === ' ' || e.key === '/' || (e.key === 'ArrowRight' && atEnd))) return go('n', 0)
  }
  const fracActions = {
    insert: (text: string) => {
      if (locked) return
      if (text.trim() === '/' ) return focusField('d')
      if (text === ' ') return focusField('n')
      const v = fields[active]
      const [st, en] = fieldCaret()
      setField(active, v.slice(0, st) + text + v.slice(en))
      focusField(active, st + text.length)
    },
    back: () => {
      if (locked) return
      const v = fields[active]
      const [st, en] = fieldCaret()
      if (st !== en) {
        setField(active, v.slice(0, st) + v.slice(en))
        return focusField(active, st)
      }
      if (st > 0) {
        setField(active, v.slice(0, st - 1) + v.slice(st))
        return focusField(active, st - 1)
      }
      const i = fieldOrder.indexOf(active)
      if (i > 0) focusField(fieldOrder[i - 1])
    },
    move: (dir: -1 | 1) => {
      const v = fields[active]
      const [st] = fieldCaret()
      const pos = st + dir
      if (pos >= 0 && pos <= v.length) return focusField(active, pos)
      const i = fieldOrder.indexOf(active) + dir
      if (i >= 0 && i < fieldOrder.length) focusField(fieldOrder[i], dir > 0 ? 0 : undefined)
    },
    enter: onEnter,
    close: () => {
      pad.setOpen(false)
      if (pad.touch) requestAnimationFrame(() => refOf(active).current?.focus())
    },
  }
  const fieldBox = (f: Field) => (
    <input
      ref={refOf(f)}
      className={cn('field frac-box', f === 'n' && 'answer-input', f === 'w' && 'frac-whole', state === 'right' && 'is-right', state === 'wrong' && 'is-wrong')}
      value={fields[f]}
      onChange={(e) => typeIn(f, e.target.value)}
      onFocus={() => setActive(f)}
      onKeyDown={fieldKeys(f)}
      readOnly={locked}
      aria-label={FIELD_LABEL[f]}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      inputMode={pad.touch && keypadOpen ? 'none' : 'decimal'}
      enterKeyHint="done"
    />
  )

  const preview = readsAs(a, value)

  return (
    <div className="grid gap-2">
      <div className="answer-row">
        {q.prefix && <MathHtml inline className="affix" html={q.prefix} />}
        {stacked ? (
          <span className="frac-answer" role="group" aria-label={wholeShown ? 'Your answer: a whole number and a fraction' : 'Your answer: a fraction'}>
            {wholeShown && fieldBox('w')}
            <span className="frac-answer-stack">
              {fieldBox('n')}
              <span className="frac-answer-bar" aria-hidden="true" />
              {fieldBox('d')}
            </span>
          </span>
        ) : (
        <input
          ref={inputRef}
          className={cn('field answer-input', state === 'right' && 'is-right', state === 'wrong' && 'is-wrong', year <= 2 && 'answer-big')}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            cursor.current = e.target.selectionStart
          }}
          onSelect={remember}
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
          inputMode={pad.touch && keypadOpen ? 'none' : 'text'}
          enterKeyHint="done"
        />
        )}
        {q.suffix && <MathHtml inline className="affix" html={q.suffix} />}
        {stacked && !mixedAnswer && !improperOnly && !locked && (
          <button
            type="button"
            className={cn('btn btn-ghost btn-sm pad-toggle', wholeShown && 'is-open')}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (wholeShown) {
                setWantWhole(false)
                setField('w', '')
                focusField('n')
              } else {
                setWantWhole(true)
                focusField('w')
              }
            }}
            aria-pressed={wholeShown}
            title={wholeShown ? 'Remove the whole-number box' : 'Add a whole-number box (for a mixed numeral)'}
          >
            {wholeShown ? 'Fraction only' : 'Mixed numeral'}
          </button>
        )}
        {!locked && (
          <KeypadToggle
            open={keypadOpen}
            onToggle={() => {
              if (keypadOpen) return actions.close()
              if (pad.touch && calcOpen) setCalcOpen(false)
              pad.setOpen(true)
            }}
          />
        )}
        {calc && <CalculatorToggle open={calcOpen} onToggle={() => setCalcOpen(!calcOpen)} />}
      </div>
      {preview && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Reads as <MathHtml inline html={preview} />
        </p>
      )}
      {calc && calcOpen && (
        <Calculator
          year={year}
          trig={q.calc === 'trig'}
          fractions={a.kind === 'frac'}
          onClose={() => setCalcOpen(false)}
          onUse={(text) => {
            onChange(text)
            place(text.length)
          }}
        />
      )}
      {keypadOpen && <MathKeypad layout={layout} big={year <= 2} touch={pad.touch} canEnter={value.trim() !== ''} enterLabel={enterLabel} actions={stacked ? fracActions : actions} />}
      {!locked && help && <p className="text-sm text-muted-foreground">{help}</p>}
    </div>
  )
}

/** A typeset preview of powers and fractions as the student types them, e.g. x^2 shows as x². */
function readsAs(a: Answer, value: string): string | null {
  if (!['expr', 'primefactors', 'sci'].includes(a.kind) || !/[\^]/.test(value)) return null
  const s = normalise(value)
  try {
    parse(s.replace(/^[a-zA-Z]\s*=\s*/, ''))
  } catch {
    return null
  }
  return ex(s)
}
