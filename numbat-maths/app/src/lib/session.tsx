// Who is using the site: a student (class code + PIN), a parent (the same details as their
// child, but a read-only parent view), a teacher, or a guest.
// The log-in token lives in localStorage; the server is asked who it belongs to.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useSafeQuery } from './safe-query'
import { load, save } from './storage'

export interface StudentMe {
  kind: 'student'
  studentId: string
  name: string
  classId: string
  className: string
  year: number
  points: number
}

export interface TeacherMe {
  kind: 'teacher'
  teacherId: string
  name: string
  email: string
}

export interface ParentMe {
  kind: 'parent'
  studentId: string
  childName: string
  classId: string
  className: string
  year: number
}

export type Me = StudentMe | TeacherMe | ParentMe

interface SessionValue {
  /** True once the saved log-in has been read and checked. */
  ready: boolean
  /** The server could not be reached or returned an error. */
  serverError: boolean
  token: string | null
  me: Me | null
  student: StudentMe | null
  teacher: TeacherMe | null
  parent: ParentMe | null
  signIn: (token: string) => void
  signOut: () => Promise<void>
}

const TOKEN_KEY = 'numbat.token'

const SessionContext = createContext<SessionValue>({
  ready: false,
  serverError: false,
  token: null,
  me: null,
  student: null,
  teacher: null,
  parent: null,
  signIn: () => {},
  signOut: async () => {},
})

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // undefined = not read yet (server render and first client render)
  const [token, setToken] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    setToken(load(TOKEN_KEY))
  }, [])

  const meQuery = useSafeQuery(api.accounts.me, token ? { token } : 'skip')
  const me = meQuery.data as Me | null | undefined
  const serverError = !!meQuery.error
  const logOut = useMutation(api.accounts.logOut)

  // A token the server no longer knows (expired, PIN reset, account removed) is cleared.
  useEffect(() => {
    if (token && me === null) {
      save(TOKEN_KEY, null)
      setToken(null)
    }
  }, [token, me])

  const signIn = useCallback((t: string) => {
    save(TOKEN_KEY, t)
    setToken(t)
  }, [])

  const signOut = useCallback(async () => {
    const t = token
    save(TOKEN_KEY, null)
    setToken(null)
    if (t) {
      try {
        await logOut({ token: t })
      } catch {
        // the token is already forgotten on this device
      }
    }
  }, [token, logOut])

  const value = useMemo<SessionValue>(() => {
    const ready = token === null || (typeof token === 'string' && (me !== undefined || serverError))
    const who = token && me ? me : null
    return {
      ready,
      serverError,
      token: token ?? null,
      me: who,
      student: who?.kind === 'student' ? who : null,
      teacher: who?.kind === 'teacher' ? who : null,
      parent: who?.kind === 'parent' ? who : null,
      signIn,
      signOut,
    }
  }, [token, me, serverError, signIn, signOut])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionValue {
  return useContext(SessionContext)
}

export function firstName(name: string): string {
  return name.split(' ')[0] || name
}
