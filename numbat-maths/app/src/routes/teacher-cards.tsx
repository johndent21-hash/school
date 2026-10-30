// Printable login cards: one per student, with the site address and class code.
import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { ArrowLeft, Printer } from 'lucide-react'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { Logo } from '@/components/numbat/Logo'
import { PageLoading, PreviewLocked, Shell } from '@/components/numbat/Shell'
import { pageHead } from '@/lib/meta'
import { PREVIEW_ONLY } from '@/lib/preview'
import { useSession } from '@/lib/session'
import { useMounted } from '@/lib/use-mounted'

export const Route = createFileRoute('/teacher-cards')({
  validateSearch: (s: Record<string, unknown>): { id?: string } => ({ id: typeof s.id === 'string' ? s.id : undefined }),
  head: () => pageHead('/teacher-cards'),
  component: CardsPage,
})

function CardsPage() {
  const mounted = useMounted()
  const { ready, teacher } = useSession()
  return (
    <Shell>
      {PREVIEW_ONLY ? (
        <PreviewLocked what="Teacher accounts" />
      ) : !mounted || !ready ? (
        <PageLoading />
      ) : teacher ? (
        <Cards />
      ) : (
        <Link to="/teacher" className="btn btn-primary">
          Teacher log in
        </Link>
      )}
    </Shell>
  )
}

function Cards() {
  const { id } = Route.useSearch()
  const { token } = useSession()
  const report = useQuery(api.classes.classReport, token && id ? { token, classId: id as Id<'classes'> } : 'skip') as
    | { ok: true; class: { id: string; name: string; year: number; code: string }; students: { id: string; name: string }[] }
    | { ok: false; message: string }
    | undefined

  if (report === undefined) return <PageLoading />
  if (!report.ok) return <p className="feedback bad">{report.message}</p>
  const site = window.location.host

  return (
    <div className="grid gap-5">
      <div className="no-print flex flex-wrap items-center gap-3">
        <Link to="/teacher-class" search={{ id: report.class.id, tab: 'students' }} className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} aria-hidden="true" /> {report.class.name}
        </Link>
        <button type="button" className="btn btn-primary" onClick={() => window.print()}>
          <Printer size={18} aria-hidden="true" /> Print
        </button>
        <p className="text-sm text-muted-foreground">Prints 8 cards to a page. Cut them out and hand them to students.</p>
      </div>
      {report.students.length === 0 ? (
        <p className="panel p-5 text-muted-foreground">Add students first.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2 print:gap-2">
          {report.students.map((s) => (
            <div key={s.id} className="print-card panel grid gap-2 border-2 border-dashed p-4">
              <div className="flex items-center gap-2">
                <Logo size={26} />
                <span className="font-display text-lg font-semibold">Numbat Maths</span>
                <span className="ml-auto text-sm text-muted-foreground">{report.class.name}</span>
              </div>
              <p className="font-display text-2xl font-semibold">{s.name}</p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 text-sm">
                <dt className="text-muted-foreground">Website</dt>
                <dd className="font-bold">{site}</dd>
                <dt className="text-muted-foreground">Class code</dt>
                <dd className="chip-code text-lg font-bold tracking-widest">{report.class.code}</dd>
              </dl>
              <p className="text-sm text-muted-foreground">Type the class code, tap your name, then choose a 4-digit PIN. Keep your PIN secret.</p>
              <p className="border-t border-dashed border-border pt-1 text-xs text-muted-foreground">
                <strong className="text-foreground">Parents and carers:</strong> go to {site}/parent and log in with the same class code, your child’s name and their PIN to see their progress.
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
