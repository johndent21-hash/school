import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowRight, BookOpen, GraduationCap, PencilLine, Trophy } from 'lucide-react'
import { Shell } from '@/components/numbat/Shell'
import { topicsForYear, YEARS } from '@/content'
import { cleanCode } from '@/lib/codes'
import { pageHead } from '@/lib/meta'
import { firstName, useSession } from '@/lib/session'
import { load } from '@/lib/storage'
import { useMounted } from '@/lib/use-mounted'

export const Route = createFileRoute('/')({
  head: () => pageHead('/'),
  component: Landing,
})

function StudentLogin() {
  const mounted = useMounted()
  const { ready, student, teacher, signOut } = useSession()
  const navigate = useNavigate()
  const [code, setCode] = useState(() => (typeof window === 'undefined' ? '' : cleanCode(load('numbat.lastCode') ?? '')))

  if (!mounted || !ready) return <div className="skel h-72" aria-label="Loading" />

  if (student) {
    return (
      <div className="panel grid gap-4 p-6">
        <h2 className="font-display text-2xl font-semibold">Welcome back, {firstName(student.name)}!</h2>
        <p className="text-muted-foreground">
          You’re logged in to {student.className} (Year {student.year}).
        </p>
        <Link to="/home" className="btn btn-primary btn-lg">
          Keep going <ArrowRight size={18} aria-hidden="true" />
        </Link>
        <button type="button" className="btn btn-ghost" onClick={() => void signOut()}>
          Not you? Log out
        </button>
      </div>
    )
  }
  if (teacher) {
    return (
      <div className="panel grid gap-4 p-6">
        <h2 className="font-display text-2xl font-semibold">Hi {firstName(teacher.name)}</h2>
        <p className="text-muted-foreground">You’re logged in as a teacher.</p>
        <Link to="/teacher" className="btn btn-primary btn-lg">
          Go to my classes <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    )
  }

  return (
    <form
      className="panel grid gap-4 p-6"
      onSubmit={(e) => {
        e.preventDefault()
        if (code.length === 6) void navigate({ to: '/join', search: { code } })
      }}
    >
      <div>
        <h2 className="font-display text-2xl font-semibold">Students: log in</h2>
        <p className="text-muted-foreground">Type the class code your teacher gave you.</p>
      </div>
      <label className="grid gap-1">
        <span className="label">Class code</span>
        <input
          className="field chip-code text-center text-3xl font-bold uppercase"
          value={code}
          onChange={(e) => setCode(cleanCode(e.target.value))}
          placeholder="ABC123"
          aria-describedby="code-help"
          autoComplete="off"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          maxLength={8}
        />
        <span id="code-help" className="text-sm text-muted-foreground">
          6 letters and numbers
        </span>
      </label>
      <button type="submit" className="btn btn-primary btn-lg" disabled={code.length !== 6}>
        Next <ArrowRight size={18} aria-hidden="true" />
      </button>
      <div className="grid gap-2 border-t border-border pt-4 text-sm">
        <Link to="/home" className="font-bold text-primary underline-offset-4 hover:underline">
          No code? Practise as a guest
        </Link>
        <Link to="/teacher" className="font-bold text-primary underline-offset-4 hover:underline">
          Teachers: log in or sign up
        </Link>
      </div>
    </form>
  )
}

const STEPS = [
  {
    icon: BookOpen,
    title: 'Learn',
    text: 'Short lessons with key points and worked examples that reveal one step at a time. Every page can be read aloud.',
  },
  {
    icon: PencilLine,
    title: 'Practise',
    text: 'Ten questions per skill that start easy and get harder. Instant marking, a hint after a wrong answer, two tries, then the full working.',
  },
  {
    icon: Trophy,
    title: 'Master',
    text: 'Score 80% to master a skill. Topic tests check the whole topic. Points and mastery badges show how far you’ve come.',
  },
]

function Landing() {
  return (
    <Shell>
      <div className="grid gap-12">
        <section className="grid items-start gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-x-8">
          <div className="grid gap-5 pt-2">
            <span className="chip w-fit">NSW Years 7, 8 and 9 · Stage 4 and Stage 5</span>
            <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Learn it. Practise it. <span className="text-primary">Master it.</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Step-by-step lessons, instant-feedback practice and topic tests for every Year 7–9 topic in the NSW Mathematics K–10 Syllabus. Students log in with a class code
              and a PIN: no email needed.
            </p>
          </div>
          {/* On phones the log-in box comes straight after the heading */}
          <div className="lg:row-span-2">
            <StudentLogin />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.title} className="panel grid content-start gap-2 p-4">
                <s.icon className="text-primary" aria-hidden="true" />
                <h2 className="font-display text-lg font-semibold">{s.title}</h2>
                <p className="text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4" aria-labelledby="years">
          <h2 id="years" className="font-display text-2xl font-semibold">
            What’s inside
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {YEARS.map((y) => {
              const topics = topicsForYear(y)
              const skills = topics.reduce((t, x) => t + x.skills.length, 0)
              return (
                <Link key={y} to="/home" search={{ year: y }} className="topic-tile" style={{ ['--hue' as string]: y === 7 ? 172 : y === 8 ? 205 : 352 }}>
                  <div className="flex items-center gap-3">
                    <span className="tile-mark">{y}</span>
                    <div>
                      <h3 className="font-display text-xl font-semibold">Year {y}</h3>
                      <p className="text-sm text-muted-foreground">
                        {topics.length} topics · {skills} skills · {y === 9 ? 'Stage 5 core' : 'Stage 4'}
                      </p>
                    </div>
                  </div>
                  <ul className="grid gap-1 text-sm">
                    {topics.map((t) => (
                      <li key={t.id}>{t.title}</li>
                    ))}
                  </ul>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="panel grid gap-6 p-6 md:grid-cols-[1fr_1.4fr]" aria-labelledby="teachers">
          <div className="grid content-start gap-3">
            <GraduationCap className="text-primary" size={32} aria-hidden="true" />
            <h2 id="teachers" className="font-display text-2xl font-semibold">
              For teachers
            </h2>
            <p className="text-muted-foreground">Set up a class in about a minute. Your students are working in the next.</p>
            <Link to="/teacher" className="btn btn-primary w-fit">
              Teacher log in <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <ol className="grid gap-3">
            {[
              { text: 'Create a class and paste in your students’ names. You get a 6-character class code and printable login cards.' },
              { text: 'Students type the code, tap their name and choose a 4-digit PIN. You can reset a forgotten PIN in one click.' },
              { text: 'Set tasks with due dates, and follow every student in the markbook by skill and topic test.' },
            ].map((s, k) => (
              <li key={k} className="flex gap-3">
                <span className="tile-mark grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft font-bold text-primary">{k + 1}</span>
                <p className="pt-1">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </Shell>
  )
}
