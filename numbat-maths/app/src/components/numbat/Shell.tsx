import { Link } from '@tanstack/react-router'
import { LogOut, Star } from 'lucide-react'
import { Logo } from './Logo'
import { firstName, useSession } from '@/lib/session'
import { useMounted } from '@/lib/use-mounted'

export function Shell({ children }: { children: React.ReactNode }) {
  const mounted = useMounted()
  const { ready, serverError, student, teacher, signOut } = useSession()
  const show = mounted && ready

  return (
    <div className="page-bg flex min-h-screen flex-col">
      <header className="site-header no-print">
        <div className="site-header-inner">
          <Link
            to={show && teacher ? '/teacher' : show && student ? '/home' : '/'}
            className="flex min-w-0 items-center gap-2 rounded-lg text-foreground no-underline"
            aria-label="Numbat Maths home"
          >
            <Logo />
            <span className="font-display truncate text-xl font-semibold max-[380px]:hidden">Numbat Maths</span>
          </Link>

          <nav className="ml-auto flex items-center gap-2" aria-label="Account">
            {show && student && (
              <>
                <span className="points-pill" title="Your points">
                  <Star size={16} fill="currentColor" aria-hidden="true" />
                  {student.points.toLocaleString('en-AU')}
                  <span className="sr-only">points</span>
                </span>
                <span className="hidden font-bold sm:inline">{firstName(student.name)}</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => void signOut()}>
                  <LogOut size={16} aria-hidden="true" />
                  <span className="max-sm:sr-only">Log out</span>
                </button>
              </>
            )}
            {show && teacher && (
              <>
                <Link to="/teacher" className="btn btn-ghost btn-sm">
                  My classes
                </Link>
                <Link to="/home" className="btn btn-ghost btn-sm max-sm:hidden">
                  Student view
                </Link>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => void signOut()}>
                  <LogOut size={16} aria-hidden="true" />
                  <span className="max-sm:sr-only">Log out</span>
                </button>
              </>
            )}
            {show && !student && !teacher && (
              <Link to="/" className="btn btn-primary btn-sm">
                Log in
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main id="main" className="shell-main flex-1">
        {show && serverError && (
          <p className="feedback info mb-4 text-sm" role="status">
            We can’t reach the Numbat Maths server right now, so logging in and saving results won’t work. Practice questions still work. Try again in a few minutes.
          </p>
        )}
        {children}
      </main>
      <footer className="no-print border-t border-border bg-card/70">
        <div className="mx-auto max-w-6xl px-4 py-5 text-sm text-muted-foreground">
          Numbat Maths covers Years 7–9 of the NSW Mathematics K–10 Syllabus (NESA, 2022). It is an independent resource, not made or endorsed by NESA.
        </div>
      </footer>
    </div>
  )
}

/** Placeholder shown while a page waits for the browser or the server. */
export function PageLoading() {
  return (
    <div className="grid gap-4" aria-busy="true" aria-label="Loading">
      <div className="skel h-10 w-2/3 max-w-md" />
      <div className="skel h-5 w-full max-w-xl" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="skel h-32" />
        <div className="skel h-32" />
        <div className="skel h-32" />
      </div>
    </div>
  )
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'good' | 'bad'; children: React.ReactNode }) {
  return <div className={`feedback ${tone} text-sm`}>{children}</div>
}

export function NotFoundPanel({ what }: { what: string }) {
  return (
    <div className="mx-auto grid max-w-md gap-4 text-center">
      <h1 className="font-display text-3xl font-semibold">We couldn’t find that {what}</h1>
      <Link to="/home" className="btn btn-primary">
        Go to my topics
      </Link>
    </div>
  )
}
