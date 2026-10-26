import { cn } from '@/lib/utils'

/**
 * Renders question and lesson HTML. All of it is produced by the site's own question
 * generators (never by users), so it is safe to insert as HTML.
 */
export function MathHtml({ html, className, inline = false }: { html: string; className?: string; inline?: boolean }) {
  if (inline) return <span className={cn('mx', className)} dangerouslySetInnerHTML={{ __html: html }} />
  return <div className={cn('mx', className)} dangerouslySetInnerHTML={{ __html: html }} />
}

export function Diagram({ svg, note }: { svg?: string; note?: string }) {
  if (!svg && !note) return null
  return (
    <figure className="q-diagram">
      {svg && <div dangerouslySetInnerHTML={{ __html: svg }} />}
      {note && <figcaption>{note}</figcaption>}
    </figure>
  )
}
