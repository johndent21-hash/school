// Student log-in: class code → tap your name → PIN (chosen the first time).
import { useEffect, useMemo, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { ArrowLeft, ArrowRight, Search } from 'lucide-react'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { PageLoading, Shell } from '@/components/numbat/Shell'
import { PinPad } from '@/components/numbat/PinPad'
import { cleanCode } from '@/lib/codes'
import { pageHead } from '@/lib/meta'
import { firstName, useSession } from '@/lib/session'
import { useSafeQuery } from '@/lib/safe-query'
import { load, save } from '@/lib/storage'
import { useMounted } from '@/lib/use-mounted'

export const Route = createFileRoute('/join')({
  validateSearch: (s: Record<string, unknown>): { code?: string } => ({
    code: typeof s.code === 'string' || typeof s.code === 'number' ? cleanCode(String(s.code)) || undefined : undefined,
  }),
  head: () => pageHead('/join'),
  component: JoinPage,
})

interface Lookup {
  ok: true
  code: string
  className: string
  year: number
  teacherName: string
  students: { id: Id<'students'>; name: string; hasPin: boolean }[]
}

function JoinPage() {
  const mounted = useMounted()
  return <Shell>{mounted ? <Join /> : <PageLoading />}</Shell>
}

function Join() {
  const search = Route.useSearch()
  const navigate = useNavigate()
  const { signIn } = useSession()
  const [codeInput, setCodeInput] = useState(search.code ?? cleanCode(load('numbat.lastCode') ?? ''))
  const [code, setCode] = useState<string | null>(search.code && search.code.length === 6 ? search.code : null)
  const [who, setWho] = useState<Lookup['students'][number] | null>(null)
  const [filter, setFilter] = useState('')
  const [mode, setMode] = useState<'enter' | 'create' | 'confirm'>('enter')
  const [pin, setPin] = useState('')
  const [firstPin, setFirstPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const lookupQuery = useSafeQuery(api.accounts.classLookup, code ? { code } : 'skip')
  const lookup = (lookupQuery.error ? { ok: false, message: 'We can’t reach the Numbat Maths server right now. Try again in a minute.' } : lookupQuery.data) as
    | Lookup
    | { ok: false; message: string }
    | undefined
  const logIn = useMutation(api.accounts.studentLogIn)
  const setPinM = useMutation(api.accounts.studentSetPin)

  useEffect(() => {
    if (search.code && search.code.length === 6) setCode(search.code)
  }, [search.code])

  const students = lookup && lookup.ok ? lookup.students : []
  const shown = useMemo(() => {
    const f = filter.trim().toLowerCase()
    return f ? students.filter((s) => s.name.toLowerCase().includes(f)) : students
  }, [students, filter])

  const done = (token: string) => {
    if (code) save('numbat.lastCode', code)
    signIn(token)
    void navigate({ to: '/home' })
  }

  const choose = (s: Lookup['students'][number]) => {
    setWho(s)
    setMode(s.hasPin ? 'enter' : 'create')
    setPin('')
    setFirstPin('')
    setError(null)
    window.scrollTo({ top: 0 })
  }

  const submitPin = async (p: string) => {
    if (!who || !code) return
    setError(null)
    if (mode === 'create') {
      if (/^(\d)\1{3}$/.test(p) || p === '1234') {
        setError('That PIN is too easy to guess. Choose another one.')
        setPin('')
        return
      }
      setFirstPin(p)
      setPin('')
      setMode('confirm')
      return
    }
    setBusy(true)
    try {
      if (mode === 'confirm') {
        if (p !== firstPin) {
          setError('Those PINs didn’t match. Choose your PIN again.')
          setMode('create')
          setPin('')
          setFirstPin('')
          return
        }
        const r = (await setPinM({ code, studentId: who.id, pin: p })) as { ok: true; token: string } | { ok: false; message: string }
        if (r.ok) return done(r.token)
        setError(r.message)
        setMode(r.message.includes('already have a PIN') ? 'enter' : 'create')
        setPin('')
        return
      }
      const r = (await logIn({ code, studentId: who.id, pin: p })) as { ok: true; token: string } | { ok: false; message: string; needsPin?: boolean }
      if (r.ok) return done(r.token)
      if (r.needsPin) {
        setMode('create')
        setError('Your teacher has reset your PIN. Choose a new one.')
      } else setError(r.message)
      setPin('')
    } catch {
      setError('Something went wrong. Check your internet connection and try again.')
      setPin('')
    } finally {
      setBusy(false)
    }
  }

  // Step 1: class code
  if (!code) {
    return (
      <div className="mx-auto grid max-w-md gap-5">
        <h1 className="font-display text-3xl font-semibold">Log in</h1>
        <form
          className="panel grid gap-4 p-6"
          onSubmit={(e) => {
            e.preventDefault()
            if (codeInput.length === 6) setCode(codeInput)
          }}
        >
          <label className="grid gap-1">
            <span className="label">Class code</span>
            <input
              className="field chip-code text-center text-3xl font-bold uppercase"
              value={codeInput}
              onChange={(e) => setCodeInput(cleanCode(e.target.value))}
              placeholder="ABC123"
              autoFocus
              autoComplete="off"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
            />
          </label>
          <button type="submit" className="btn btn-primary btn-lg" disabled={codeInput.length !== 6}>
            Next <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>
      </div>
    )
  }

  if (lookup === undefined) return <PageLoading />

  if (!lookup.ok) {
    return (
      <div className="mx-auto grid max-w-md gap-4">
        <h1 className="font-display text-3xl font-semibold">Hmm, that didn’t work</h1>
        <p className="feedback bad">{lookup.message}</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setCode(null)
            setCodeInput(code)
            void navigate({ to: '/join', search: {} })
          }}
        >
          Try another code
        </button>
      </div>
    )
  }

  // Step 3: PIN
  if (who) {
    const title = mode === 'enter' ? `Hi ${firstName(who.name)}! Enter your PIN` : mode === 'create' ? `Hi ${firstName(who.name)}! Choose a PIN` : 'Type your new PIN again'
    return (
      <div className="mx-auto grid max-w-sm gap-5 text-center">
        <button type="button" className="btn btn-ghost btn-sm w-fit" onClick={() => setWho(null)}>
          <ArrowLeft size={16} aria-hidden="true" /> Not {firstName(who.name)}?
        </button>
        <div className="grid gap-1">
          <h1 className="font-display text-3xl font-semibold">{title}</h1>
          <p className="text-muted-foreground">
            {mode === 'enter' && '4 digits'}
            {mode === 'create' && 'Pick 4 digits you’ll remember, and keep them secret. Not 1234 or 1111.'}
            {mode === 'confirm' && 'Just checking you typed it the way you meant.'}
          </p>
        </div>
        <PinPad value={pin} onChange={setPin} onComplete={(p) => void submitPin(p)} disabled={busy} />
        {error && (
          <p className="feedback bad" role="alert">
            {error}
          </p>
        )}
        {mode === 'enter' && <p className="text-sm text-muted-foreground">Forgotten your PIN? Ask your teacher to reset it.</p>}
      </div>
    )
  }

  // Step 2: choose name
  return (
    <div className="mx-auto grid max-w-3xl gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="chip chip-code mb-2">{lookup.code}</p>
          <h1 className="font-display text-3xl font-semibold">{lookup.className}</h1>
          <p className="text-muted-foreground">
            Year {lookup.year}
            {lookup.teacherName ? ` · ${lookup.teacherName}` : ''}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setCode(null)
            void navigate({ to: '/join', search: {} })
          }}
        >
          Wrong class?
        </button>
      </div>
      <h2 className="font-display text-xl font-semibold">Tap your name</h2>
      {students.length > 12 && (
        <label className="relative block max-w-sm">
          <span className="sr-only">Find your name</span>
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input className="field pl-10" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Type to find your name" />
        </label>
      )}
      {students.length === 0 ? (
        <p className="feedback info">Your teacher hasn’t added any students to this class yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {shown.map((s) => (
            <button key={s.id} type="button" className="name-btn" onClick={() => choose(s)}>
              {s.name}
            </button>
          ))}
        </div>
      )}
      <p className="text-sm text-muted-foreground">Not on the list? Ask your teacher to add you.</p>
      <p className="text-sm">
        <Link to="/" className="font-bold text-primary">
          Back to the start
        </Link>
      </p>
    </div>
  )
}
