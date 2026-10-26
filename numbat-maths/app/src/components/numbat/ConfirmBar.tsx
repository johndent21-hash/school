/** An in-page "are you sure?" bar, used instead of the browser's confirm() pop-up. */
export function ConfirmBar({
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  danger = false,
}: {
  message: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}) {
  return (
    <div className="feedback info flex flex-wrap items-center gap-3" role="alert">
      <span className="min-w-0 flex-1">{message}</span>
      <span className="flex flex-wrap gap-2">
        <button type="button" className={danger ? 'btn btn-danger btn-sm' : 'btn btn-primary btn-sm'} onClick={onConfirm} autoFocus>
          {confirmLabel}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
          {cancelLabel}
        </button>
      </span>
    </div>
  )
}
