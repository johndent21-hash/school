// Printable worksheets and topic tests made from the class-game question bank, and their separate answer keys.
// A sheet is rebuilt from its settings (the picks and a seed), like a game, so Version A and Version B are two seeds.
// The printout is one stand-alone HTML document (its own styles, diagrams inline), printed with the browser's
// Print → Save as PDF; the same document is what the page previews, so what you see is what prints.
import { setSeed, shuffle } from '@/lib/maths/rand'
import type { GameMaker, GameQuestion, GameSet } from './types'

export type SheetKind = 'worksheet' | 'test'
/** written: working space and an answer line. choices: the game's four options (A–D). */
export type AnswerStyle = 'written' | 'choices'

/** One line of the selection: an exercise, optionally narrowed to some of its question kinds, and how many. */
export interface SheetPick {
  set: GameSet
  /** kind names (maker.t) to draw from; empty = every kind in the set */
  kinds: string[]
  count: number
}

export interface SheetItem {
  q: GameQuestion
  set: GameSet
  d: 1 | 2
  /** extension: the exercise is beyond the stage (no outcome codes) */
  ext: boolean
}

export type Level = 'foundation' | 'core' | 'extension'
export const LEVELS: Record<Level, { title: string; who: string }> = {
  foundation: { title: 'Foundation', who: 'Core: every student should be able to do these unaided.' },
  core: { title: 'Developing', who: 'Core: one more step of thinking.' },
  extension: { title: 'Extension', who: 'Extension: beyond the core of the stage.' },
}
export const levelOf = (it: SheetItem): Level => (it.ext ? 'extension' : it.d === 2 ? 'core' : 'foundation')

const key = (q: GameQuestion) => q.prompt + '|' + (q.diagram ?? '') + '|' + q.options[q.correct]

/** The questions for a selection: each pick's kinds in turn (every kind once before any repeats), no repeats. */
export function buildSheet(picks: SheetPick[], seed: number): SheetItem[] {
  setSeed(seed)
  const seen = new Set<string>()
  const out: SheetItem[] = []
  for (const p of picks) {
    const makers = p.kinds.length ? p.set.makers.filter((m) => p.kinds.includes(m.t)) : p.set.makers
    if (!makers.length) continue
    const order: GameMaker[] = []
    while (order.length < p.count) {
      const pass = shuffle(makers)
      if (order.length === 0) pass.sort((a, b) => (a.d ?? 1) - (b.d ?? 1))
      order.push(...pass)
    }
    for (const m of order.slice(0, p.count)) {
      let q: GameQuestion | null = null
      for (let i = 0; i < 40 && !q; i++) {
        const c = m.make()
        if (!seen.has(key(c))) q = c
      }
      // a kind that has run out of new questions: another kind of the same pick steps in
      for (const o of shuffle(makers)) {
        if (q) break
        for (let i = 0; i < 20 && !q; i++) {
          const c = o.make()
          if (!seen.has(key(c))) q = c
        }
      }
      if (!q) continue
      seen.add(key(q))
      out.push({ q, set: p.set, d: m.d ?? 1, ext: p.set.outcomes.length === 0 })
    }
  }
  return out
}

const plain = (h: string) =>
  h
    .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** Questions that point at their options ("Which of these…") can only be asked with them. */
export function needsChoices(q: GameQuestion): boolean {
  return /\b(these|the following|which of|which one|which statement|which list|which expression|which equation)\b/i.test(plain(q.prompt))
}

/** Every question starts as written (working space and an answer line), except those that need their choices. */
export const startStyle = (q: GameQuestion): AnswerStyle => (needsChoices(q) ? 'choices' : 'written')

/** A suggested mix: statements, yes/no answers and "which one" questions with their choices, the rest written. */
export function defaultStyle(q: GameQuestion): AnswerStyle {
  if (needsChoices(q)) return 'choices'
  const right = plain(q.options[q.correct])
  const words = plain(q.prompt)
  if (/\b(which|what type|true or false|best describes|most likely)\b/i.test(words)) return 'choices'
  if (/^(yes|no|always|never|sometimes|could|it|the|a|an)\b/i.test(right)) return 'choices'
  if (right.length > 24 || /[A-Za-z]{4,} [A-Za-z]{3,}/.test(right)) return 'choices'
  return 'written'
}

/** marks: a choice is 1; a written answer is 1, or 2 (working shown) for a question with one more step */
export const marksFor = (it: SheetItem, style: AnswerStyle) => (style === 'written' && it.d === 2 ? 2 : 1)

/** About a minute a mark on paper, plus 5 minutes' reading time, rounded up to 5 minutes. */
export const minutesFor = (marks: number) => Math.ceil((marks + 5) / 5) * 5

export interface SheetSpec {
  kind: SheetKind
  /** printed above the title, e.g. the school's name */
  school?: string
  title: string
  /** e.g. "NCM 8 · Year 8" */
  subtitle: string
  version?: 'A' | 'B'
  items: SheetItem[]
  styles: AnswerStyle[]
}

/** the order questions are printed in: a test is grouped by level (foundation, core, extension); a worksheet keeps
 *  the textbook order, grouped by exercise. Returns sections of item indexes. */
export function sections(spec: SheetSpec): { heading: string; note: string; idx: number[] }[] {
  const idx = spec.items.map((_, i) => i)
  if (spec.kind === 'test') {
    const order: Level[] = ['foundation', 'core', 'extension']
    return order
      .map((lv, k) => ({ lv, k, idx: idx.filter((i) => levelOf(spec.items[i]) === lv) }))
      .filter((s) => s.idx.length)
      .map((s, k) => {
        const marks = s.idx.reduce((t, i) => t + marksFor(spec.items[i], spec.styles[i]), 0)
        return { heading: `Section ${'ABC'[k]}: ${LEVELS[s.lv].title} (${marks} mark${marks === 1 ? '' : 's'})`, note: LEVELS[s.lv].who, idx: s.idx }
      })
  }
  const out: { heading: string; note: string; idx: number[] }[] = []
  for (const i of idx) {
    const s = spec.items[i].set
    const last = out[out.length - 1]
    if (last && spec.items[last.idx[0]].set === s) last.idx.push(i)
    else out.push({ heading: `${s.exercise} ${s.title}`, note: s.outcomes.length ? s.outcomes.join(', ') : 'Extension', idx: [i] })
  }
  return out
}

export const totalMarks = (spec: SheetSpec) => spec.items.reduce((t, it, i) => t + marksFor(it, spec.styles[i]), 0)

/** every outcome code on the sheet, in order of first appearance */
export const outcomesOf = (items: SheetItem[]) => [...new Set(items.flatMap((it) => it.set.outcomes))]

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const LETTERS = 'ABCD'

/** The printout (the sheet, or its answer key) as one stand-alone HTML document. mathsCss: the site's maths styles. */
export function sheetHtml(spec: SheetSpec, mathsCss: string, opts: { key?: boolean; working?: boolean } = {}): string {
  const test = spec.kind === 'test'
  const marks = totalMarks(spec)
  const secs = sections(spec)
  // questions are numbered in print order
  const numberOf = new Map<number, number>()
  secs.flatMap((s) => s.idx).forEach((i, k) => numberOf.set(i, k + 1))
  const head = `${esc(spec.title)}${spec.version ? ` · Version ${spec.version}` : ''}${opts.key ? ' · Answer key' : ''}`
  let body = `<header class="sh-head"><div>${spec.school ? `<p class="school">${esc(spec.school)}</p>` : ''}<h1>${head}</h1><p class="sub">${esc(spec.subtitle)} · ${test ? 'Topic test' : 'Worksheet'}${
    test ? ` · ${marks} marks · Time allowed: ${minutesFor(marks)} minutes` : ''
  }</p></div>${opts.key ? '' : '<div class="who"><span>Name</span><span>Class</span><span>Date</span></div>'}</header>`
  const codes = outcomesOf(spec.items)
  body += `<p class="codes">NSW syllabus outcomes: ${codes.length ? codes.map(esc).join(', ') : 'none (extension only)'}${
    spec.items.some((it) => it.ext) ? '. Questions marked Extension go beyond the core of the stage.' : '.'
  }</p>`
  if (!opts.key)
    body += `<p class="instr">${
      test ? 'Answer every question. Show your working where there is space for it. Calculators are not needed.' : 'Show your working in the space given. Calculators are not needed.'
    } For questions with choices, circle A, B, C or D.</p>`
  for (const s of secs) {
    body += `<h2>${esc(s.heading)}</h2><p class="note">${esc(s.note)}</p>`
    if (opts.key) body += '<ol class="key">'
    for (const i of s.idx) {
      const it = spec.items[i]
      const q = it.q
      const n = numberOf.get(i)!
      const style = spec.styles[i]
      const m = marksFor(it, style)
      const tag = `${test ? `<span class="mk">${m} mark${m === 1 ? '' : 's'}</span>` : ''}${it.ext && spec.kind === 'worksheet' ? '<span class="mk">Extension</span>' : ''}`
      if (opts.key) {
        const ans = style === 'choices' ? `<b>${LETTERS[q.correct]}</b> ${q.options[q.correct]}` : `<b>${q.options[q.correct]}</b>`
        body += `<li value="${n}"><span class="mx">${ans}</span>${test ? ` <span class="mk">${m}</span>` : ''}${opts.working !== false ? `<div class="why mx">${q.why}</div>` : ''}</li>`
        continue
      }
      body += `<section class="q${q.diagram ? ' has-dg' : ''}"><div class="qn">${n}</div><div class="qb"><div class="qp mx">${tag}${q.prompt}</div>`
      if (q.diagram || q.note) body += `<figure class="dgw">${q.diagram ?? ''}${q.note ? `<figcaption>${esc(q.note)}</figcaption>` : ''}</figure>`
      if (style === 'choices') body += `<ol class="opts">${q.options.map((o, k) => `<li><b>${LETTERS[k]}</b> <span class="mx">${o}</span></li>`).join('')}</ol>`
      else body += `<div class="work w${it.d}"></div><p class="ans">Answer: <span></span></p>`
      body += '</div></section>'
    }
    if (opts.key) body += '</ol>'
  }
  if (test && opts.key) body += `<p class="total">Total: ${marks} marks. Two-mark questions: 1 mark for correct working, 1 for the answer.</p>`
  return `<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><title>${head}</title>${FONTS}<style>${SHEET_CSS}\n${mathsCss}</style></head><body>${body}</body></html>`
}

const FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=STIX+Two+Text:ital,wght@0,400;0,600;1,400&display=swap">'

const SHEET_CSS = `
:root{--foreground:215 40% 14%;--card:0 0% 100%;--primary:205 85% 34%;--muted:210 30% 96%;--muted-foreground:215 16% 38%;
--accent-2:352 70% 48%;--sun:42 96% 52%;--sun-soft:45 100% 92%;--border:207 26% 78%;--grid-line:205 30% 86%;
--shape:190 55% 96%;--shape-2:190 45% 90%;--shape-3:190 38% 84%;
--font-body:'Atkinson Hyperlegible','Segoe UI',Arial,sans-serif;--font-math:'STIX Two Text','Cambria Math','Times New Roman',serif}
@page{size:A4;margin:14mm 14mm 16mm}
*{box-sizing:border-box}
body{margin:0 auto;max-width:182mm;padding:8mm 0;font:11pt/1.45 var(--font-body);color:hsl(var(--foreground));background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
@media print{body{padding:0;max-width:none}}
h1{font-size:17pt;margin:0}h2{font-size:12.5pt;margin:6mm 0 0;padding-bottom:1mm;border-bottom:1.5px solid hsl(var(--foreground))}
.sh-head{display:flex;justify-content:space-between;gap:6mm;align-items:flex-start;border-bottom:2.5px solid hsl(var(--foreground));padding-bottom:3mm}
.sub{margin:1mm 0 0;color:hsl(var(--muted-foreground))}
.who{display:grid;gap:2.5mm;min-width:62mm}.who span{display:block;border-bottom:1px solid #888;padding-top:3mm;font-size:9pt;color:#555}
.codes,.instr,.note,.total{font-size:9.5pt;color:hsl(var(--muted-foreground));margin:2mm 0}
.q{display:flex;gap:3mm;padding:3mm 0;border-bottom:1px solid #ddd;break-inside:avoid}
.qn{font-weight:700;min-width:7mm}.qb{flex:1;min-width:0}
.has-dg .qb{display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:5mm;align-items:start}
.has-dg .qb{grid-template-rows:auto 1fr auto}.has-dg .qb>*{grid-column:1}.has-dg .qb>.dgw{grid-column:2;grid-row:1/3}
.has-dg .qb>.ans{grid-column:1/-1;grid-row:3;align-self:end}.has-dg .qb>.opts{grid-row:2/-1}
.school{margin:0 0 1mm;font-size:9.5pt;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:hsl(var(--muted-foreground))}
.qp .big{font-size:13pt;margin:1mm 0}
.mk{float:right;position:relative;z-index:1;font-size:8.5pt;color:#555;border:1px solid #bbb;border-radius:3px;padding:0 1.5mm;margin-left:2mm}
.dgw{margin:0;width:52mm}.dgw svg{max-height:40mm;width:100%;height:auto}.dgw figcaption{font-size:8.5pt;font-style:italic;color:#555}
.dg{margin:0}
.opts{list-style:none;padding:0;margin:1.5mm 0 0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1mm 6mm}
.opts li{display:flex;gap:2mm;align-items:baseline}.opts b{display:inline-grid;place-items:center;width:5.5mm;height:5.5mm;border:1px solid #888;border-radius:50%;font-size:8.5pt;flex-shrink:0}
.work.w1{height:12mm}.work.w2{height:26mm}
.ans{margin:0;text-align:right}.ans span{display:inline-block;width:48mm;border-bottom:1px solid #444}
.key{padding-left:9mm;margin:2mm 0}.key li{padding:1.2mm 0;border-bottom:1px solid #eee;break-inside:avoid}
.key .why{font-size:9.5pt;color:#444}.key .mk{float:none}
`
