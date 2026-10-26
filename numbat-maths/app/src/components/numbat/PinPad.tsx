import { useEffect } from 'react'
import { Delete } from 'lucide-react'

/** Four-digit PIN entry with big buttons; the keyboard works too. Calls onComplete at 4 digits. */
export function PinPad({ value, onChange, onComplete, disabled = false }: { value: string; onChange: (v: string) => void; onComplete: (pin: string) => void; disabled?: boolean }) {
  const press = (d: string) => {
    if (disabled || value.length >= 4) return
    const next = value + d
    onChange(next)
    if (next.length === 4) onComplete(next)
  }
  const back = () => {
    if (!disabled) onChange(value.slice(0, -1))
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (/^\d$/.test(e.key)) {
        e.preventDefault()
        press(e.key)
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        back()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="grid gap-5">
      <div className="pin-dots" aria-label={`${value.length} of 4 digits entered`} role="status">
        {[0, 1, 2, 3].map((k) => (
          <span key={k} className={k < value.length ? 'on' : ''} />
        ))}
      </div>
      <div className="pin-pad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} type="button" onClick={() => press(d)} disabled={disabled}>
            {d}
          </button>
        ))}
        <span />
        <button type="button" onClick={() => press('0')} disabled={disabled}>
          0
        </button>
        <button type="button" onClick={back} disabled={disabled} aria-label="Delete last digit">
          <Delete className="mx-auto" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
