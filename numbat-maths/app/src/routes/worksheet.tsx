// Print a worksheet or a topic test from the class-game question bank, with a separate answer key.
// One click from a game (?id=<exercise or chapter>) fills the selection; the builder below changes it.
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, Download, Minus, Plus, Printer, Shuffle } from 'lucide-react'
import mathsCss from '@/maths.css?raw'
import { MathHtml } from '@/components/numbat/MathHtml'
import { PageLoading, Shell } from '@/components/numbat/Shell'
import { GAME_BOOKS, findGame } from '@/content/games'
import { canSaveInViewer, saveText } from '@/lib/csv'
import type { GameSet } from '@/lib/game/types'
import {
  type AnswerStyle, type SheetKind, type SheetSpec, buildSheet, defaultStyle, LEVELS, levelOf, marksFor, minutesFor, needsChoices, sheetHtml, startStyle, totalMarks,
} from '@/lib/game/sheet'
import { setSeed } from '@/lib/maths/rand'
import { pageHead } from '@/lib/meta'
import { load, save } from '@/lib/storage'
import { newSeed } from '@/lib/practice'
import { useMounted } from '@/lib/use-mounted'

export const Route = createFileRoute('/worksheet')({
  validateSearch: (s: Record<string, unknown>): { id?: string; test?: 1 } => ({
    id: typeof s.id === 'string' ? s.id : undefined,
    test: s.test === 1 || s.test === '1' ? 1 : undefined,
  }),
  head: () => pageHead('/worksheet'),
  component: WorksheetPage,
})

function WorksheetPage() {
  const mounted = useMounted()
  const { id, test } = Route.useSearch()
  return <Shell>{mounted ? <Builder key={id ?? ''} id={id} test={test === 1} /> : <PageLoading />}</Shell>
}

const MAX_EACH = 20
const MAX_TOTAL = 60

/** where each exercise sits: its book and chapter */
const PLACE = new Map<string, { book: (typeof GAME_BOOKS)[number]; chapter: (typeof GAME_BOOKS)[number]['chapters'][number]; order: number }>()
let order = 0
for (const book of GAME_BOOKS) for (const chapter of book.chapters) for (const s of chapter.sets) PLACE.set(s.id, { book, chapter, order: order++ })
const SETS = new Map<string, GameSet>(GAME_BOOKS.flatMap((b) => b.chapters.flatMap((c) => c.sets.map((s) => [s.id, s] as const))))

function startingCounts(id?: string): Record<string, number> {
  const g = id ? findGame(id) : undefined
  if (!g) return {}
  if (g.set) return { [g.set.id]: 10 }
  return Object.fromEntries(g.chapter.sets.map((s) => [s.id, 2]))
}

function defaultTitle(counts: Record<string, number>): string {
  const ids = Object.keys(counts).filter((k) => counts[k] > 0)
  if (ids.length === 1) {
    const s = SETS.get(ids[0])!
    return `${s.ref}: ${s.title}`
  }
  const chapters = [...new Set(ids.map((k) => PLACE.get(k)!.chapter))]
  if (chapters.length === 1) return `${chapters[0].ref}: ${chapters[0].title}`
  return 'Mixed revision'
}

function Builder({ id, test }: { id?: string; test: boolean }) {
  const found = id ? findGame(id) : undefined
  const [kind, setKind] = useState<SheetKind>(test ? 'test' : 'worksheet')
  const [counts, setCounts] = useState<Record<string, number>>(() => startingCounts(id))
  const [kinds, setKinds] = useState<Record<string, string[]>>({})
  const [seed, setSeedState] = useState(newSeed)
  const [version, setVersion] = useState<'A' | 'B'>('A')
  const [overrides, setOverrides] = useState<Record<number, AnswerStyle>>({})
  const [working, setWorking] = useState(true)
  const [showKey, setShowKey] = useState(false)
  const [bookId, setBookId] = useState(found?.book.id ?? GAME_BOOKS[0].id)
  const [titleEdit, setTitleEdit] = useState<string | null>(null)
  const [viewer, setViewer] = useState(false)
  const [school, setSchool] = useState(() => {
    const v = load('numbat.school')
    return typeof v === 'string' ? v : ''
  })
  useEffect(() => void canSaveInViewer().then(setViewer), [])

  const picks = useMemo(
    () =>
      Object.keys(counts)
        .filter((k) => counts[k] > 0 && SETS.has(k))
        .sort((a, b) => PLACE.get(a)!.order - PLACE.get(b)!.order)
        .map((k) => ({ set: SETS.get(k)!, kinds: kinds[k] ?? [], count: counts[k] })),
    [counts, kinds],
  )
  const items = useMemo(() => buildSheet(picks, seed + (version === 'B' ? 7919 : 0)), [picks, seed, version])
  // a new selection or new questions: back to the suggested answer styles
  useEffect(() => setOverrides({}), [items])
  const styles = items.map((it, i) => (needsChoices(it.q) ? 'choices' : (overrides[i] ?? startStyle(it.q))))
  const title = titleEdit ?? defaultTitle(counts)
  const books = [...new Set(picks.map((p) => PLACE.get(p.set.id)!.book))]
  const spec: SheetSpec = {
    kind,
    school: school.trim() || undefined,
    title,
    subtitle: books.map((b) => `${b.short} · Year ${b.year}`).join(' and ') || 'Numbat Maths',
    version,
    items,
    styles,
  }
  const html = sheetHtml(spec, mathsCss, { key: showKey, working })
  const total = items.length
  const marks = totalMarks(spec)
  const fileBase = `${title.replace(/[^\w ,.–-]+/g, '').trim()} ${kind === 'test' ? 'Topic test' : 'Worksheet'} ${version}`

  const setCount = (sid: string, n: number) => {
    const others = total - (counts[sid] ?? 0)
    setCounts((c) => ({ ...c, [sid]: Math.max(0, Math.min(MAX_EACH, n, MAX_TOTAL - others)) }))
  }
  const print = (key: boolean) => {
    const doc = sheetHtml(spec, mathsCss, { key, working })
    const f = document.createElement('iframe')
    f.style.cssText = 'position:fixed;width:0;height:0;border:0;right:0;bottom:0'
    f.srcdoc = doc
    f.onload = () => {
      try {
        f.contentWindow?.focus()
        f.contentWindow?.print()
      } catch {
        // printing is blocked here: the save button is the way out
      }
      setTimeout(() => f.remove(), 60_000)
    }
    document.body.appendChild(f)
  }
  const save = (key: boolean) => void saveText(`${fileBase}${key ? ' answer key' : ''}.html`, sheetHtml(spec, mathsCss, { key, working }), 'text/html;charset=utf-8')
  const book = GAME_BOOKS.find((b) => b.id === bookId) ?? GAME_BOOKS[0]

  return (
    <div className="grid gap-6">
      <Link to={found ? '/game' : '/games'} search={found ? { id } : {}} className="btn btn-ghost btn-sm w-fit">
        <ArrowLeft size={16} aria-hidden="true" /> {found ? 'Back to the game' : 'All class games'}
      </Link>
      <header className="grid gap-2">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Print a worksheet or topic test</h1>
        <p className="max-w-3xl text-muted-foreground">
          Questions come from the class-game bank, written to match each textbook exercise. Choose for each question whether students write the answer with
          working or pick from the four choices. The answer key prints separately. Use Print, then “Save as PDF” to keep a copy.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="grid content-start gap-6">
          <section className="panel grid gap-4 p-5" aria-labelledby="ws-what">
            <h2 id="ws-what" className="font-display text-2xl font-semibold">
              What to print
            </h2>
            <div className="tabs w-fit" role="radiogroup" aria-label="Worksheet or topic test">
              {(['worksheet', 'test'] as const).map((k) => (
                <button key={k} type="button" role="radio" aria-checked={kind === k} className={kind === k ? 'active' : ''} onClick={() => setKind(k)}>
                  {k === 'worksheet' ? 'Worksheet' : 'Topic test'}
                </button>
              ))}
            </div>
            <label className="grid gap-1">
              <span className="label mb-0">School name (optional, printed at the top)</span>
              <input
                className="field"
                value={school}
                maxLength={80}
                onChange={(e) => {
                  setSchool(e.target.value)
                  save('numbat.school', e.target.value)
                }}
              />
            </label>
            <label className="grid gap-1">
              <span className="label mb-0">Title</span>
              <input className="field" value={title} maxLength={80} onChange={(e) => setTitleEdit(e.target.value)} />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <div className="tabs w-fit" role="radiogroup" aria-label="Version">
                {(['A', 'B'] as const).map((v) => (
                  <button key={v} type="button" role="radio" aria-checked={version === v} className={version === v ? 'active' : ''} onClick={() => setVersion(v)}>
                    Version {v}
                  </button>
                ))}
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSeedState(newSeed())}>
                <Shuffle size={14} aria-hidden="true" /> New questions
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Version A and Version B ask the same kinds of question with different numbers, for students sitting side by side.
            </p>
          </section>

          <section className="panel grid gap-3 p-5" aria-labelledby="ws-from">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="ws-from" className="font-display text-2xl font-semibold">
                Questions from
              </h2>
              <div className="tabs" role="tablist" aria-label="Textbook">
                {GAME_BOOKS.map((b) => (
                  <button key={b.id} type="button" role="tab" aria-selected={b.id === book.id} className={b.id === book.id ? 'active' : ''} onClick={() => setBookId(b.id)}>
                    {b.short}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Set how many questions from each exercise (up to {MAX_TOTAL} in all). Open “Kinds” to use only some kinds of question.
            </p>
            {book.chapters.map((c) => {
              const n = c.sets.reduce((t, s) => t + (counts[s.id] ?? 0), 0)
              return (
                <details key={c.id} className="ws-chapter" open={n > 0 || undefined}>
                  <summary>
                    <span className="font-semibold">
                      Chapter {c.number}: {c.title}
                    </span>
                    {n > 0 && <span className="chip">{n}</span>}
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm ml-auto"
                      onClick={(e) => {
                        e.preventDefault()
                        setCounts((cs) => ({ ...cs, ...Object.fromEntries(c.sets.map((s) => [s.id, n > 0 ? 0 : 2])) }))
                      }}
                    >
                      {n > 0 ? 'Clear' : '2 from each'}
                    </button>
                  </summary>
                  <ul className="grid gap-1 py-2">
                    {c.sets.map((s) => (
                      <SetRow
                        key={s.id}
                        set={s}
                        count={counts[s.id] ?? 0}
                        kinds={kinds[s.id] ?? []}
                        onCount={(k) => setCount(s.id, k)}
                        onKinds={(ks) => setKinds((all) => ({ ...all, [s.id]: ks }))}
                      />
                    ))}
                  </ul>
                </details>
              )
            })}
          </section>

          {items.length > 0 && (
            <section className="panel grid gap-3 p-5" aria-labelledby="ws-style">
              <h2 id="ws-style" className="font-display text-2xl font-semibold">
                Answer style
              </h2>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOverrides(Object.fromEntries(items.map((_, i) => [i, 'written'])))}>
                  All written
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOverrides(Object.fromEntries(items.map((_, i) => [i, 'choices'])))}>
                  All with choices
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOverrides(Object.fromEntries(items.map((it, i) => [i, defaultStyle(it.q)])))}>
                  Suggested mix
                </button>
              </div>
              <ol className="grid gap-1">
                {items.map((it, i) => (
                  <li key={i} className="ws-style-row">
                    <span className="text-sm text-muted-foreground">
                      {it.set.exercise} · {LEVELS[levelOf(it)].title}
                    </span>
                    <MathHtml inline className="ws-snippet" html={it.q.prompt.replace(/<div class="big">/g, ' <span>').replace(/<\/div>/g, '</span>')} />
                    {needsChoices(it.q) ? (
                      <span className="text-sm text-muted-foreground" title="The question points at its choices, so it is always printed with them">
                        Needs its choices
                      </span>
                    ) : (
                      <span className="tabs tabs-sm" role="radiogroup" aria-label={`Question ${i + 1} answer style`}>
                        {(['written', 'choices'] as const).map((st) => (
                          <button key={st} type="button" role="radio" aria-checked={styles[i] === st} className={styles[i] === st ? 'active' : ''} onClick={() => setOverrides((o) => ({ ...o, [i]: st }))}>
                            {st === 'written' ? 'Written' : 'Choices'}
                          </button>
                        ))}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
              <p className="text-sm text-muted-foreground">Questions listed in the order they were picked; a topic test prints them grouped by level.</p>
            </section>
          )}
        </div>

        <section className="panel grid content-start gap-3 p-5 lg:sticky lg:top-4" aria-labelledby="ws-preview">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="ws-preview" className="font-display text-2xl font-semibold">
              Preview
            </h2>
            <div className="tabs" role="tablist" aria-label="Sheet or answer key">
              <button type="button" role="tab" aria-selected={!showKey} className={!showKey ? 'active' : ''} onClick={() => setShowKey(false)}>
                {kind === 'test' ? 'Test' : 'Worksheet'}
              </button>
              <button type="button" role="tab" aria-selected={showKey} className={showKey ? 'active' : ''} onClick={() => setShowKey(true)}>
                Answer key
              </button>
            </div>
          </div>
          {total === 0 ? (
            <p className="text-muted-foreground">Choose some exercises to see the sheet.</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {total} question{total === 1 ? '' : 's'}
                {kind === 'test' ? ` · ${marks} marks · ${minutesFor(marks)} minutes` : ''} · two-mark questions (written, one more step) get more working space.
              </p>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={working} onChange={(e) => setWorking(e.target.checked)} /> Short working in the answer key
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-primary" onClick={() => print(false)}>
                  <Printer size={18} aria-hidden="true" /> Print the {kind === 'test' ? 'test' : 'worksheet'}
                </button>
                <button type="button" className="btn btn-soft" onClick={() => print(true)}>
                  <Printer size={18} aria-hidden="true" /> Print the answer key
                </button>
              </div>
              {viewer && (
                <div className="grid gap-2 rounded-lg bg-primary-soft p-3 text-sm">
                  <p>If printing is blocked in this preview, save the page, open it, then Print → Save as PDF.</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => save(false)}>
                      <Download size={14} aria-hidden="true" /> Save the {kind === 'test' ? 'test' : 'worksheet'}
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => save(true)}>
                      <Download size={14} aria-hidden="true" /> Save the answer key
                    </button>
                  </div>
                </div>
              )}
              <iframe title={showKey ? 'Answer key preview' : 'Sheet preview'} className="ws-frame" srcDoc={html} />
            </>
          )}
        </section>
      </div>
    </div>
  )
}

function SetRow({ set, count, kinds, onCount, onKinds }: { set: GameSet; count: number; kinds: string[]; onCount: (n: number) => void; onKinds: (k: string[]) => void }) {
  const [open, setOpen] = useState(false)
  // one sample question per kind, as its label (made only when the list is opened)
  const samples = useMemo(() => {
    if (!open) return []
    return set.makers.map((m) => {
      setSeed(5)
      return { t: m.t, d: m.d ?? 1, prompt: m.make().prompt.replace(/<div class="big">/g, ' <span>').replace(/<\/div>/g, '</span>') }
    })
  }, [open, set])
  const ref = useRef<HTMLDetailsElement>(null)
  return (
    <li className="ws-set">
      <div className="flex flex-wrap items-center gap-2">
        <span className="min-w-0 flex-1">
          {set.exercise} {set.title}
          {set.outcomes.length === 0 && <span className="chip ml-2">Extension</span>}
        </span>
        <span className="flex items-center gap-1" role="group" aria-label={`Questions from ${set.exercise}`}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onCount(count - 1)} disabled={count <= 0} aria-label="One fewer">
            <Minus size={14} aria-hidden="true" />
          </button>
          <span className="min-w-6 text-center font-semibold tnum" aria-live="polite">
            {count}
          </span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onCount(count === 0 ? 2 : count + 1)} aria-label="One more">
            <Plus size={14} aria-hidden="true" />
          </button>
        </span>
      </div>
      <details ref={ref} onToggle={() => setOpen(!!ref.current?.open)}>
        <summary className="text-sm text-muted-foreground">Kinds{kinds.length ? `: ${kinds.length} of ${set.makers.length}` : ''}</summary>
        <ul className="grid gap-1 py-1">
          {samples.map((s) => (
            <li key={s.t}>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={kinds.length === 0 || kinds.includes(s.t)}
                  onChange={(e) => {
                    const all = set.makers.map((m) => m.t)
                    const now = kinds.length ? kinds : all
                    const next = e.target.checked ? [...now, s.t] : now.filter((k) => k !== s.t)
                    onKinds(next.length === all.length ? [] : next.length ? next : now)
                  }}
                />
                <span>
                  <span className="text-muted-foreground">{s.d === 2 ? 'Developing · ' : 'Foundation · '}</span>
                  <MathHtml inline html={s.prompt} />
                </span>
              </label>
            </li>
          ))}
        </ul>
      </details>
    </li>
  )
}
