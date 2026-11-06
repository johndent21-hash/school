// The on-screen calculator, offered only on questions marked "Calculator allowed".
// Year 7: a basic calculator with the sign-change key, x² and Ans. Years 8 and up: scientific keys (√, x², xʸ, π, Ans).
// Year 9 trigonometry questions also get sin, cos, tan and the ° ′ ″ key (degrees, minutes and seconds).
// When a question asks for a fraction (Years 7–9), the calculator also gets a fraction key and a mixed-numeral key,
// which put a stacked fraction with empty boxes into the calculation, ◂ ▸ keys to move between the boxes, and an
// F⇄D key that switches the answer between fraction, mixed numeral and decimal. Otherwise it is the regular calculator.
import { useState } from 'react'
import { Calculator as CalcIcon, Delete, X } from 'lucide-react'
import { type Exact, calcDisplay, calculate, dmsText, fractionParts, showsAsFraction } from '@/lib/maths/calc'
import { cn } from '@/lib/utils'

// Kept between questions, like a real calculator's memory and the student's choice to have it open
let lastAns: { value: number; exact?: Exact } = { value: 0 }
let keepOpen = false

type CKey = {
  label: string
  insert?: string
  /** starts a new calculation after "=" (e.g. the sign-change key types a new negative number) */
  fresh?: boolean
  /** an empty space in the key grid */
  spacer?: boolean
  act?: 'back' | 'clear' | 'equals' | 'second' | 'frac' | 'mixed' | 'fd' | 'prev' | 'next' | 'dms'
  title?: string
  cls?: string
  /** drawn as a little stacked fraction instead of text */
  icon?: 'frac' | 'mixed'
}
const d = (n: string): CKey => ({ label: n, insert: n, cls: 'pad-digit' })
const op = (label: string, insert: string, title: string): CKey => ({
  label,
  insert,
  title,
  cls: 'pad-sym',
})

const BASIC: CKey[][] = [
  [d('7'), d('8'), d('9'), { label: '⌫', act: 'back', title: 'Delete', cls: 'pad-act' }, { label: 'AC', act: 'clear', title: 'Clear all', cls: 'pad-act' }],
  [d('4'), d('5'), d('6'), op('×', '×', 'times'), op('÷', '÷', 'divide')],
  [d('1'), d('2'), d('3'), op('+', '+', 'plus'), op('−', '−', 'minus')],
  [d('0'), d('.'), op('(', '(', 'open bracket'), op(')', ')', 'close bracket'), { label: '=', act: 'equals', title: 'Equals', cls: 'pad-go' }],
]
const SCI: CKey[] = [
  op('√', '√(', 'square root'),
  op('x²', '²', 'squared'),
  op('xʸ', '^', 'to the power of'),
  op('π', 'π', 'pi'),
  op('Ans', 'Ans', 'the last answer'),
]

// Year 7: the sign-change key and x², which New Century Maths 7 uses for integers (Ex 1.09)
const YEAR7: CKey[] = [
  { label: '(−)', insert: '−', title: 'sign change: makes the next number negative', cls: 'pad-sym', fresh: true },
  op('x²', '²', 'squared'),
  op('Ans', 'Ans', 'the last answer'),
  { label: '', spacer: true },
  { label: '', spacer: true },
]

// Fraction questions: the fraction keys, the F⇄D key and keys to move between the boxes of a fraction
const FRAC_ROW: CKey[] = [
  { label: 'Fraction', act: 'frac', icon: 'frac', title: 'Fraction: a box on top and a box underneath', cls: 'pad-sym' },
  { label: 'Mixed numeral', act: 'mixed', icon: 'mixed', title: 'Mixed numeral: a whole number and a fraction', cls: 'pad-sym' },
  { label: 'F⇄D', act: 'fd', title: 'Show the answer as a fraction, a mixed numeral or a decimal', cls: 'pad-sym' },
  { label: '◂', act: 'prev', title: 'Previous box', cls: 'pad-act' },
  { label: '▸', act: 'next', title: 'Next box', cls: 'pad-act' },
]

// Inserts that start a new calculation after "=", rather than carrying on from the last answer
const STARTS_NEW = /^[\d.(π√sct]|^Ans/
const MULTI = ['sin⁻¹(', 'cos⁻¹(', 'tan⁻¹(', 'sin(', 'cos(', 'tan(', '√(', 'Ans', '×10^']

export function useCalculatorOpen(): [boolean, (open: boolean) => void] {
  const [open, setOpenState] = useState(keepOpen)
  return [
    open,
    (o: boolean) => {
      keepOpen = o
      setOpenState(o)
    },
  ]
}

export function CalculatorToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={cn('btn btn-ghost btn-sm pad-toggle', open && 'is-open')}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onToggle}
      aria-pressed={open}
      title={open ? 'Hide the calculator' : 'Show the calculator'}
    >
      <CalcIcon size={16} aria-hidden="true" />
      <span className="sr-only sm:not-sr-only">Calculator</span>
    </button>
  )
}

type Field = 'w' | 'n' | 'd'
/** a fraction keyed with the fraction keys: an optional whole number, a top box and a bottom box */
type FracItem = { mixed: boolean; w: string; n: string; d: string }
type Item = string | FracItem
type Spot = { i: number; f: Field } | null
type Form = 'frac' | 'mixed' | 'dec' | 'dms'
type Out = { ok: true; value: number; exact?: Exact } | { ok: false; message: string }

const fieldsOf = (it: FracItem): Field[] => (it.mixed ? ['w', 'n', 'd'] : ['n', 'd'])
const FIELD_NAME: Record<Field, string> = { w: 'whole number', n: 'top', d: 'bottom' }
/** what the calculator works out: fractions as ⟦n|d⟧ or ⟦w|n|d⟧ */
const encode = (items: Item[]) => items.map((it) => (typeof it === 'string' ? it : `⟦${it.mixed ? `${it.w}|` : ''}${it.n}|${it.d}⟧`)).join('')
function appendText(items: Item[], t: string): Item[] {
  const last = items[items.length - 1]
  return typeof last === 'string' ? [...items.slice(0, -1), last + t] : [...items, t]
}

/** a stacked number pair for the display */
function Stack({ top, bottom }: { top: React.ReactNode; bottom: React.ReactNode }) {
  return (
    <span className="cstack">
      <span>{top}</span>
      <span className="cbar" aria-hidden="true" />
      <span>{bottom}</span>
    </span>
  )
}
/** the little picture on the fraction keys */
function KeyIcon({ kind }: { kind: 'frac' | 'mixed' }) {
  return (
    <span className="ckey-icon" aria-hidden="true">
      {kind === 'mixed' && <span className="ckey-box" />}
      <span className="cstack">
        <span className="ckey-box" />
        <span className="cbar" />
        <span className="ckey-box" />
      </span>
    </span>
  )
}

export function Calculator({
  year,
  trig: trigKeys = false,
  fractions: fracKeys = false,
  compact = false,
  onUse,
  onClose,
}: {
  year: number
  trig?: boolean
  /** the question asks for a fraction: show the fraction keys */
  fractions?: boolean
  compact?: boolean
  onUse?: (text: string) => void
  onClose: () => void
}) {
  const [items, setItems] = useState<Item[]>([])
  const [spot, setSpot] = useState<Spot>(null) // the box being typed in, if any
  const [out, setOut] = useState<Out | null>(null)
  const [form, setForm] = useState<Form>('dec')
  const [done, setDone] = useState(false) // just pressed "="
  const [second, setSecond] = useState(false)
  const sci = year >= 8
  // sin, cos and tan only on Year 9 trigonometry questions, so other questions keep a shorter calculator
  const trig = year >= 9 && trigKeys
  const fractions = year >= 7 && fracKeys

  const startAgain = (next: Item[], nextSpot: Spot = null) => {
    setItems(next)
    setSpot(nextSpot)
    setDone(false)
    setOut(null)
  }
  const setField = (i: number, f: Field, text: string) => setItems(items.map((it, j) => (j === i && typeof it !== 'string' ? { ...it, [f]: text } : it)))
  const fracIndexes = () => items.flatMap((it, i) => (typeof it === 'string' ? [] : [i]))

  const move = (dir: 1 | -1) => {
    const fis = fracIndexes()
    if (spot) {
      const fs = fieldsOf(items[spot.i] as FracItem)
      const j = fs.indexOf(spot.f) + dir
      if (j >= 0 && j < fs.length) return setSpot({ i: spot.i, f: fs[j] })
      if (dir > 0) {
        const nx = fis.find((i) => i > spot.i)
        return setSpot(nx === undefined ? null : { i: nx, f: fieldsOf(items[nx] as FracItem)[0] })
      }
      const pv = [...fis].reverse().find((i) => i < spot.i)
      if (pv !== undefined) setSpot({ i: pv, f: 'd' })
      return
    }
    if (dir < 0 && fis.length) setSpot({ i: fis[fis.length - 1], f: 'd' })
  }

  const back = () => {
    if (done) {
      setDone(false)
      setOut(null)
    }
    if (spot) {
      const it = items[spot.i] as FracItem
      const fs = fieldsOf(it)
      if (it[spot.f] !== '') return setField(spot.i, spot.f, it[spot.f].slice(0, -1))
      const j = fs.indexOf(spot.f)
      if (j > 0) return setSpot({ i: spot.i, f: fs[j - 1] })
      if (fs.every((f) => it[f] === '')) {
        setItems(items.filter((_, k) => k !== spot.i))
        setSpot(null)
      }
      return
    }
    const last = items[items.length - 1]
    if (last === undefined) return
    if (typeof last !== 'string') return setSpot({ i: items.length - 1, f: 'd' })
    const m = MULTI.find((t) => last.endsWith(t))
    const rest = last.slice(0, last.length - (m ? m.length : 1))
    setItems(rest ? [...items.slice(0, -1), rest] : items.slice(0, -1))
  }

  const equals = () => {
    const r = calculate(encode(items), lastAns)
    setOut(r)
    if (r.ok) {
      lastAns = { value: r.value, exact: r.exact }
      setDone(true)
      setSpot(null)
      setForm(fractions && showsAsFraction(r.exact) ? 'frac' : 'dec')
    }
  }

  /** ° ′ ″: marks the number just typed as degrees, then minutes, then seconds; after "=", shows the answer in degrees and minutes */
  const dms = () => {
    if (done && out?.ok) return setForm(form === 'dms' ? 'dec' : 'dms')
    if (spot) return
    const last = items[items.length - 1]
    const t = typeof last === 'string' ? last : ''
    if (!/\d$/.test(t)) return
    const sym = /°\d+(\.\d*)?′\d+(\.\d*)?$/.test(t) ? '″' : /°\d+(\.\d*)?$/.test(t) ? '′' : /[°′″]\d*$/.test(t) && /″\d*$/.test(t) ? null : '°'
    if (sym) setItems(appendText(items, sym))
  }

  /** F⇄D: fraction → mixed numeral (if bigger than 1) → decimal → fraction */
  const cycle = () => {
    if (!done || !out?.ok || !showsAsFraction(out.exact)) return
    const big = fractionParts(out.exact!).whole > 0n
    setForm(form === 'frac' ? (big ? 'mixed' : 'dec') : form === 'mixed' ? 'dec' : 'frac')
  }

  const press = (k: CKey) => {
    switch (k.act) {
      case 'clear':
        return startAgain([])
      case 'second':
        return setSecond(!second)
      case 'fd':
        return cycle()
      case 'dms':
        return dms()
      case 'prev':
        return move(-1)
      case 'next':
        return move(1)
      case 'back':
        return back()
      case 'equals':
        return equals()
      case 'frac':
      case 'mixed': {
        const node: FracItem = { mixed: k.act === 'mixed', w: '', n: '', d: '' }
        const base = done ? [] : items
        return startAgain([...base, node], { i: base.length, f: node.mixed ? 'w' : 'n' })
      }
    }
    const ins = k.insert ?? ''
    if (done) {
      // after "=", a number starts again; an operation carries on from the answer
      startAgain([k.fresh || STARTS_NEW.test(ins) ? ins : 'Ans' + ins])
    } else if (spot) {
      const it = items[spot.i] as FracItem
      // digits, a point, or a minus sign at the start go in the box; anything else goes after the fraction
      if (/^[\d.]$/.test(ins) || (ins === '−' && it[spot.f] === '')) setField(spot.i, spot.f, it[spot.f] + ins)
      else {
        setSpot(null)
        setItems(appendText(items, ins))
      }
    } else setItems(appendText(items, ins))
    if (second) setSecond(false)
  }

  const onKey = (e: React.KeyboardEvent) => {
    const map: Record<string, CKey> = {
      Enter: { label: '=', act: 'equals' },
      '=': { label: '=', act: 'equals' },
      Backspace: { label: '⌫', act: 'back' },
      Escape: { label: 'AC', act: 'clear' },
      '*': { label: '×', insert: '×' },
      x: { label: '×', insert: '×' },
      '/': { label: '÷', insert: '÷' },
      '-': { label: '−', insert: '−' },
      ...(fractions ? { ArrowLeft: { label: '◂', act: 'prev' as const }, ArrowRight: { label: '▸', act: 'next' as const } } : {}),
    }
    const k = map[e.key] ?? (/^[0-9.+()^]$/.test(e.key) ? { label: e.key, insert: e.key } : null)
    if (!k) return
    e.preventDefault()
    e.stopPropagation()
    press(k)
  }

  const trigRow: CKey[] = [
    {
      label: '2nd',
      act: 'second',
      title: 'Inverse functions: sin⁻¹, cos⁻¹, tan⁻¹',
      cls: cn('pad-act', second && 'is-on'),
    },
    ...(['sin', 'cos', 'tan'] as const).map((f) =>
      op(second ? `${f}⁻¹` : f, second ? `${f}⁻¹(` : `${f}(`, second ? `inverse ${f}, answer in degrees` : `${f} of an angle in degrees`),
    ),
    { label: '° ′ ″', act: 'dms', title: 'Degrees, minutes and seconds: type 36 ° ′ ″ 52 ° ′ ″ for 36°52′. After =, shows the answer in degrees and minutes.', cls: 'pad-sym' },
  ]
  const rows = [...(fractions ? [FRAC_ROW] : []), ...(trig ? [trigRow] : []), ...(sci ? [SCI] : [YEAR7]), ...BASIC]
  const shown = out?.ok ? calcDisplay(out.value) : null
  const parts = out?.ok && out.exact && (form === 'frac' || form === 'mixed') ? fractionParts(out.exact) : null
  const sign = parts?.neg ? '−' : ''
  // what "Put … in my answer box" types, in the form on show
  const answerText = !out?.ok
    ? ''
    : form === 'dms'
      ? dmsText(out.value)
      : parts && form === 'frac'
        ? `${sign}${parts.n}/${parts.d}`
        : parts && form === 'mixed'
          ? `${sign}${parts.whole > 0n ? parts.whole : ''}${parts.whole > 0n && parts.rest > 0n ? ' ' : ''}${parts.rest > 0n ? `${parts.rest}/${parts.d}` : ''}`
          : (shown?.text ?? '').replace(/-/g, '−')

  const box = (it: FracItem, i: number, f: Field) => (
    <span
      key={f}
      role="button"
      tabIndex={-1}
      aria-label={`${FIELD_NAME[f]} box${it[f] ? `: ${it[f]}` : ', empty'}`}
      className={cn('cbox', it[f] === '' && 'empty', spot?.i === i && spot.f === f && 'active')}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        if (done) {
          setDone(false)
          setOut(null)
        }
        setSpot({ i, f })
      }}
    >
      {it[f] || ' '}
    </span>
  )

  return (
    <div className={cn('calc', compact && 'calc-compact', fractions && 'calc-fractions')} role="group" aria-label="Calculator" onKeyDown={onKey}>
      <div className="calc-head">
        <span className="text-sm font-bold text-muted-foreground">
          {trig ? 'Scientific calculator · degrees' : fractions ? 'Calculator · fractions' : sci ? 'Scientific calculator' : 'Calculator'}
        </span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close the calculator">
          <X size={16} aria-hidden="true" />
        </button>
      </div>
      <div className="calc-screen" tabIndex={0} aria-label="Calculator display. You can type numbers here.">
        <div className="calc-expr">
          {items.length === 0
            ? ' '
            : items.map((it, i) =>
                typeof it === 'string' ? (
                  <span key={i}>{it}</span>
                ) : (
                  <span key={i} className="cfrac">
                    {it.mixed && box(it, i, 'w')}
                    <span className="cstack">
                      {box(it, i, 'n')}
                      <span className="cbar" aria-hidden="true" />
                      {box(it, i, 'd')}
                    </span>
                  </span>
                ),
              )}
        </div>
        <div className={cn('calc-out', out && !out.ok && 'is-error')} aria-live="polite">
          {out === null ? (
            ' '
          ) : !out.ok ? (
            out.message
          ) : form === 'dms' ? (
            dmsText(out.value)
          ) : parts ? (
            <span className="cfrac cres">
              {sign}
              {form === 'mixed' && parts.whole > 0n && <span>{String(parts.whole)}</span>}
              {(form === 'frac' || parts.rest > 0n) && <Stack top={String(form === 'frac' ? parts.n : parts.rest)} bottom={String(parts.d)} />}
            </span>
          ) : shown?.sci ? (
            <>
              {shown.sci.m.replace('-', '−')} × 10
              <sup>{String(shown.sci.n).replace('-', '−')}</sup>
            </>
          ) : (
            shown?.text.replace(/-/g, '−')
          )}
        </div>
      </div>
      <div className="calc-keys">
        {rows.flat().map((k, i) =>
          k.spacer ? (
            <span key={i} aria-hidden="true" />
          ) : (
            <button
              key={i}
              type="button"
              className={cn('pad-key', k.cls, !k.icon && k.label.length > 3 && 'calc-small')}
              title={k.title}
              aria-label={k.title ?? k.label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => press(k)}
            >
              {k.act === 'back' ? <Delete size={20} aria-hidden="true" /> : k.icon ? <KeyIcon kind={k.icon} /> : k.label}
            </button>
          ),
        )}
      </div>
      {onUse && out?.ok && answerText && (
        <button type="button" className="btn btn-soft btn-sm justify-self-start" onClick={() => onUse(answerText)}>
          Put {answerText} in my answer box
        </button>
      )}
    </div>
  )
}
