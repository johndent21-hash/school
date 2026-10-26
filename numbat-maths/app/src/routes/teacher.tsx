// Teachers: log in / sign up, then the list of classes.
import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { ArrowRight, Plus, Users } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/convex/_generated/api'
import { PageLoading, Shell } from '@/components/numbat/Shell'
import { pageHead } from '@/lib/meta'
import { firstName, useSession } from '@/lib/session'
import { useMounted } from '@/lib/use-mounted'

export const Route = createFileRoute('/teacher')({
  head: () => pageHead('/teacher'),
  component: TeacherPage,
})

export interface ClassSummary {
  id: string
  name: string
  year: number
  code: string
  createdAt: number
  studentCount: number
  activeThisWeek: number
}

function TeacherPage() {
  const mounted = useMounted()
  const { ready, teacher } = useSession()
  return <Shell>{!mounted || !ready ? <PageLoading /> : teacher ? <Classes /> : <TeacherAuth />}</Shell>
}

function TeacherAuth() {
  const { signIn, student, signOut } = useSession()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const logIn = useMutation(api.accounts.teacherLogIn)
  const signUp = useMutation(api.accounts.teacherSignUp)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const r = (mode === 'login' ? await logIn({ email, password }) : await signUp({ name, email, password, signupCode: code })) as
        | { ok: true; token: string }
        | { ok: false; message: string }
      if (r.ok) {
        if (student) await signOut()
        signIn(r.token)
      } else setError(r.message)
    } catch {
      setError('Something went wrong. Check your internet connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-md gap-5">
      <div>
        <h1 className="font-display text-3xl font-semibold">Teachers</h1>
        <p className="text-muted-foreground">Create classes, follow progress and set tasks.</p>
      </div>
      <div className="tabs w-fit" role="tablist">
        <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
          Log in
        </button>
        <button type="button" role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>
          Create account
        </button>
      </div>
      <form className="panel grid gap-4 p-6" onSubmit={submit}>
        {mode === 'signup' && (
          <label className="grid gap-1">
            <span className="label">Your name (students see this)</span>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ms Nguyen" autoComplete="name" required />
          </label>
        )}
        <label className="grid gap-1">
          <span className="label">Email</span>
          <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </label>
        <label className="grid gap-1">
          <span className="label">Password</span>
          <input
            className="field"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength={mode === 'signup' ? 8 : undefined}
            required
          />
          {mode === 'signup' && <span className="text-sm text-muted-foreground">At least 8 characters.</span>}
        </label>
        {mode === 'signup' && (
          <label className="grid gap-1">
            <span className="label">Staff access code</span>
            <input className="field chip-code uppercase" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" required />
            <span className="text-sm text-muted-foreground">This keeps teacher accounts for staff only. Ask your head teacher or the site owner for it.</span>
          </label>
        )}
        {error && (
          <p className="feedback bad" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
          {mode === 'login' ? 'Log in' : 'Create my account'}
        </button>
        {mode === 'login' && <p className="text-sm text-muted-foreground">Forgotten your password? Ask the site owner to reset it.</p>}
      </form>
      <p className="text-sm text-muted-foreground">
        Are you a student?{' '}
        <Link to="/" className="font-bold text-primary">
          Log in with your class code
        </Link>
      </p>
    </div>
  )
}

function Classes() {
  const { teacher, token } = useSession()
  const navigate = useNavigate()
  const data = useQuery(api.classes.myClasses, token ? { token } : 'skip') as { ok: true; classes: ClassSummary[] } | { ok: false; message: string } | undefined
  const create = useMutation(api.classes.createClass)
  const [name, setName] = useState('')
  const [year, setYear] = useState(7)
  const [busy, setBusy] = useState(false)

  if (data === undefined) return <PageLoading />
  if (!data.ok) return <p className="feedback bad">{data.message}</p>

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setBusy(true)
    try {
      const r = (await create({ token, name, year })) as { ok: true; classId: string; code: string } | { ok: false; message: string }
      if (r.ok) {
        toast.success(`Class created. The class code is ${r.code}.`)
        setName('')
        void navigate({ to: '/teacher-class', search: { id: r.classId, tab: 'students' } })
      } else toast.error(r.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-8">
      <header>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Hi {firstName(teacher?.name ?? '')}</h1>
        <p className="text-muted-foreground">Your classes</p>
      </header>

      {data.classes.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.classes.map((c) => (
            <Link
              key={c.id}
              to="/teacher-class"
              search={{ id: c.id }}
              className="topic-tile"
              style={{ ['--hue' as string]: c.year === 7 ? 172 : c.year === 8 ? 205 : 352 }}
            >
              <div className="flex items-start gap-3">
                <span className="tile-mark">{c.year}</span>
                <div className="min-w-0">
                  <h2 className="font-display truncate text-xl font-semibold">{c.name}</h2>
                  <p className="text-sm text-muted-foreground">Year {c.year}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="chip chip-code">{c.code}</span>
                <span className="chip">
                  <Users size={13} aria-hidden="true" /> {c.studentCount} students
                </span>
                <span className="chip">{c.activeThisWeek} active this week</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="panel grid gap-2 p-5">
          <h2 className="font-display text-xl font-semibold">Get started in three steps</h2>
          <ol className="grid list-decimal gap-1 pl-5 text-muted-foreground">
            <li>Create a class below.</li>
            <li>Add your students’ names (paste them straight from a spreadsheet).</li>
            <li>Give students the class code, or print their login cards. They choose a PIN the first time they log in.</li>
          </ol>
        </div>
      )}

      <form className="panel grid gap-4 p-5 sm:grid-cols-[1fr_auto_auto] sm:items-end" onSubmit={add}>
        <h2 className="font-display text-xl font-semibold sm:col-span-3">Create a class</h2>
        <label className="grid gap-1">
          <span className="label">Class name</span>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 7MAT2" required maxLength={60} />
        </label>
        <label className="grid gap-1">
          <span className="label">Year</span>
          <select className="field" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            <option value={7}>Year 7</option>
            <option value={8}>Year 8</option>
            <option value={9}>Year 9</option>
          </select>
        </label>
        <button type="submit" className="btn btn-primary btn-lg" disabled={busy || !name.trim()}>
          <Plus size={18} aria-hidden="true" /> Create
        </button>
      </form>

      <section className="grid gap-2 text-sm text-muted-foreground">
        <p>
          Want to see what students see?{' '}
          <Link to="/home" className="font-bold text-primary">
            Open the student view <ArrowRight size={14} className="inline" aria-hidden="true" />
          </Link>{' '}
          Nothing you do there is saved.
        </p>
      </section>
    </div>
  )
}
