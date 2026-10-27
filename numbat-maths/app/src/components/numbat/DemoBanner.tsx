import { Info } from 'lucide-react'

/** Shown on the teacher pages in the preview, where they use a made-up example class. */
export function DemoBanner() {
  return (
    <div className="feedback info flex items-start gap-2 text-sm" role="note">
      <Info size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <p>
        <strong>Example class.</strong> These students and results are made up so you can try the teacher pages. Log-ins and changes are switched off in this
        preview; on the full site each teacher sees their own classes.
      </p>
    </div>
  )
}
