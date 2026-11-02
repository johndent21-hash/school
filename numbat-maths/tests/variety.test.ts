// Independent checks for the eight skills that were widened so a 20-question set never repeats an
// identical question: Year 2 joining shapes, Year 3 symmetry, turns and 3D objects, Year 4 surveys,
// combining shapes and tessellations, Year 8 census and samples.
// Each answer is worked out again from the prompt text or the diagram (grid squares, tally marks),
// without using the generator's own working. Questions from a fixed list (no numbers) are listed once
// at the end so they can be read by eye.
//   STAGE1=1 STAGE2=1 npx tsx tests/variety.test.ts      (N per level, default 400)
import { setSeed } from '../src/lib/maths/rand'
import type { Answer, Question } from '../src/lib/maths/types'
import { ALL_TOPICS } from '../src/content/index'

const N = Number(process.env.N ?? 400)
let failures = 0
const checked: Record<string, number> = {}
const fixed = new Map<string, string>()

const strip = (h: string) =>
  h
    .replace(/<\/?(div|p|br)\b[^>]*>/g, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
const val = (a: Answer) => (a.kind === 'num' ? a.value : null)
const mcRight = (a: Answer) => (a.kind === 'mc' ? strip(a.options[a.correct]) : null)
const n = (s: string) => Number(s.replace(/[\s,]/g, ''))

// ---------------------------------------------------------------- reading diagrams

function gridCells(svg: string): [number, number][] {
  const rects = [...svg.matchAll(/<rect class="cell on" x="([\d.]+)" y="([\d.]+)" width="([\d.]+)"/g)].map((m) => [Number(m[1]), Number(m[2]), Number(m[3])])
  return rects.map(([x, y, w]) => [Math.round(x / w), Math.round(y / w)])
}

/** Lines of symmetry of a union of unit squares, found by testing every angle (0.5° steps) through the centre. */
function rasterSymmetry(cells: [number, number][]): number {
  const has = new Set(cells.map(([c, r]) => `${c},${r}`))
  const inside = (x: number, y: number) => has.has(`${Math.floor(x)},${Math.floor(y)}`)
  const cx = cells.reduce((s, c) => s + c[0] + 0.5, 0) / cells.length
  const cy = cells.reduce((s, c) => s + c[1] + 0.5, 0) / cells.length
  // sample points well inside each square, plus the area just outside the shape
  const pts: [number, number][] = []
  const xs = cells.map((c) => c[0])
  const ys = cells.map((c) => c[1])
  for (let c = Math.min(...xs) - 1; c <= Math.max(...xs) + 1; c++)
    for (let r = Math.min(...ys) - 1; r <= Math.max(...ys) + 1; r++)
      for (let i = 1; i < 12; i += 2) for (let j = 1; j < 12; j += 2) pts.push([c + i / 12, r + j / 12])
  // angles that pass come in short runs around each true line (the sample points are finite), so count the runs
  const ok: boolean[] = []
  for (let t = 0; t < 180; t += 0.5) {
    const a = (t * Math.PI) / 180
    const [ux, uy] = [Math.cos(a), Math.sin(a)]
    const good = pts.every(([x, y]) => {
      const dx = x - cx
      const dy = y - cy
      const d = dx * ux + dy * uy
      return inside(x, y) === inside(cx + 2 * d * ux - dx, cy + 2 * d * uy - dy)
    })
    ok.push(good)
  }
  let runs = 0
  for (let i = 0; i < ok.length; i++) if (ok[i] && !ok[(i - 1 + ok.length) % ok.length]) runs++
  return ok.every(Boolean) ? Infinity : runs
}

function tallyRows(svg: string): number[] {
  const rows = new Map<number, number>()
  for (const m of svg.matchAll(/class="tally tr(\d+)"/g)) rows.set(Number(m[1]), (rows.get(Number(m[1])) ?? 0) + 1)
  return [...rows.keys()].sort((a, b) => a - b).map((k) => rows.get(k)!)
}
const tallyLabels = (svg: string) => [...svg.matchAll(/<text [^>]*x="20" y="([\d.]+)"[^>]*>([^<]*)<\/text>/g)].filter((m) => Number(m[1]) > 30).map((m) => m[2])

// ---------------------------------------------------------------- checks: return null (right), a message (wrong) or 'fixed'

type Check = (q: Question, text: string) => string | null | 'fixed'
const TURNS = ['quarter turn', 'half turn', 'three-quarter turn', 'full turn']
// longest name first: 'three-quarter turn' also contains 'quarter turn'
const turnK = (s: string) => [3, 4, 2, 1].find((k) => s.includes(TURNS[k - 1])) ?? 0
const BASES: Record<string, number> = { triangular: 3, rectangular: 4, square: 4, pentagonal: 5, hexagonal: 6 }
const BASE_NOUN: Record<string, number> = { triangle: 3, rectangle: 4, square: 4, pentagon: 5, hexagon: 6 }

const CHECKS: Record<string, Check> = {
  'y2-2d-combine': (q, t) => {
    if (q.diagram) return gridCells(q.diagram).length === val(q.answer) ? null : `grid has ${gridCells(q.diagram).length} squares`
    let m = t.match(/(\d+) squares the same size are put side by side in a row/)
    if (m) return mcRight(q.answer) === 'a rectangle' ? null : 'should be a rectangle'
    m = t.match(/big square that is (\d+) small squares across and (\d+) down/)
    if (m) return n(m[1]) * n(m[2]) === val(q.answer) ? null : 'wrong count'
    return 'fixed'
  },
  'y3-2d-symmetry': (q) => {
    if (!q.diagram?.includes('class="cell on"')) return 'fixed' // drawn shapes: checked in tests/primary.test.ts
    const got = rasterSymmetry(gridCells(q.diagram))
    return got === val(q.answer) ? null : `shape has ${got} lines`
  },
  'y3-2d-turns': (q, t) => {
    const k = turnK(t)
    let m = t.match(/points to (\d+)\. It makes a .* turn (clockwise|anticlockwise)/)
    if (m) {
      const from = n(m[1])
      const to = ((((from + (m[2] === 'clockwise' ? 3 * k : -3 * k)) % 12) + 12) % 12) || 12
      return to === val(q.answer) ? null : `should be ${to}`
    }
    m = t.match(/moves (clockwise|anticlockwise) from (\d+) to (\d+)/)
    if (m) {
      const steps = ((((m[1] === 'clockwise' ? 1 : -1) * (n(m[3]) - n(m[2]))) % 12) + 12) % 12
      if (steps === 0 || steps % 3) return 'not a multiple of a quarter turn'
      return mcRight(q.answer) === TURNS[steps / 3 - 1] ? null : `should be ${TURNS[steps / 3 - 1]}`
    }
    if (/60 minutes to make a full turn/.test(t)) {
      const asked = turnK(t.split('How many minutes')[1])
      return 15 * asked === val(q.answer) ? null : `should be ${15 * asked}`
    }
    if (/same position as which turn anticlockwise/.test(t)) return mcRight(q.answer) === `a ${TURNS[4 - k - 1]}` ? null : 'wrong turn'
    return 'unrecognised'
  },
  'y3-3d-objects': (q, t) => {
    let m = t.match(/net of a (\w+) (prism|pyramid)/)
    if (m && /How many shapes altogether/.test(t)) {
      const b = BASES[m[1]]
      return (m[2] === 'prism' ? b + 2 : b + 1) === val(q.answer) ? null : 'wrong total'
    }
    if (m && /How many (rectangles|triangles)/.test(t) && !/cube|rectangular prism is made/.test(t)) return BASES[m[1]] === val(q.answer) ? null : 'wrong count'
    m = t.match(/has 2 matching (\w+) ends joined by (\d+) rectangles/)
    if (m) return BASE_NOUN[m[1]] === n(m[2]) && mcRight(q.answer) === `${Object.keys(BASES).find((k) => BASES[k] === n(m![2]) && (n(m![2]) !== 4 || k === 'rectangular'))} prism` ? null : 'wrong prism'
    m = t.match(/has an? (\w+) base and (\d+) triangles that meet/)
    if (m) {
      const want = `${Object.keys(BASES).find((k) => BASES[k] === n(m![2]) && (n(m![2]) !== 4 || k === 'square'))} pyramid`
      return BASE_NOUN[m[1]] === n(m[2]) && mcRight(q.answer) === want ? null : `should be ${want}`
    }
    if (/net of a cylinder/.test(t)) return val(q.answer) === 2 ? null : 'a cylinder net has 2 circles'
    if (/squares make a net of a cube/.test(t) || /rectangular prism is made of how many/.test(t)) return val(q.answer) === 6 ? null : 'should be 6'
    return 'fixed' // named from a drawing: checked in tests/primary.test.ts
  },
  'y4-data-survey': (q, t) => {
    if (q.diagram?.includes('tally')) {
      const counts = tallyRows(q.diagram)
      const labels = tallyLabels(q.diagram)
      let m = t.match(/How many students chose (\w+)\?$/)
      if (/left off/.test(t)) {
        const total = n(t.match(/All (\d+) students/)![1])
        return total - counts.reduce((a, b) => a + b, 0) === val(q.answer) ? null : 'missing row wrong'
      }
      if (m) {
        const i = labels.findIndex((l) => l.toLowerCase() === m![1])
        return counts[i] === val(q.answer) ? null : `tally shows ${counts[i]}`
      }
      if (/How many students answered/.test(t)) return counts.reduce((a, b) => a + b, 0) === val(q.answer) ? null : 'wrong total'
      return 'unrecognised tally question'
    }
    const m = t.match(/each grid line is (\d+) more .* between the lines for (\d+) and (\d+)/)
    if (m) return n(m[3]) - n(m[2]) === n(m[1]) && (n(m[2]) + n(m[3])) / 2 === val(q.answer) ? null : 'halfway wrong'
    return 'fixed'
  },
  'y4-2d-combine': (q, t) => {
    let m = t.match(/sides of (\d+) cm are joined, .* rectangle (\d+) cm long and (\d+) cm wide/)
    if (m) {
      const [s, a, b] = [n(m[1]), n(m[2]), n(m[3])]
      if (a % s || b % s) return 'squares do not fit exactly'
      return (a / s) * (b / s) === val(q.answer) ? null : 'wrong count'
    }
    m = t.match(/^(\d+) squares with sides of (\d+) cm are joined side to side in a row/)
    if (m) return n(m[1]) * n(m[2]) === val(q.answer) ? null : 'wrong length'
    return 'fixed'
  },
  'y4-2d-tessellate': (q, t) => {
    if (q.diagram) return gridCells(q.diagram).length === val(q.answer) ? null : 'wrong tile count'
    let m = t.match(/There are (\d+) rows with (\d+) \w+ in each row/)
    if (m) return n(m[1]) * n(m[2]) === val(q.answer) ? null : 'wrong product'
    m = t.match(/sides of (\d+) cm tessellate to cover a board (\d+) cm long and (\d+) cm wide/)
    if (m) {
      const [s, a, b] = [n(m[1]), n(m[2]), n(m[3])]
      if (a % s || b % s) return 'tiles do not fit exactly'
      return (a / s) * (b / s) === val(q.answer) ? null : 'wrong count'
    }
    if (/tessellate on its own/.test(t)) {
      const yes = ['square', 'equilateral triangle', 'regular hexagon', 'rectangle', 'rhombus', 'parallelogram', 'right-angled triangle', 'isosceles triangle']
      const no = ['circle', 'regular pentagon', 'regular octagon']
      if (q.answer.kind !== 'mc') return 'not multiple choice'
      const opts = q.answer.options.map(strip)
      const good = /not/.test(t) ? no : yes
      const right = opts.filter((o) => good.includes(o))
      if (right.length !== 1) return `${right.length} correct options`
      return mcRight(q.answer) === right[0] ? null : 'marked the wrong option'
    }
    m = t.match(/tessellation of (squares|equilateral triangles|regular hexagons)/)
    if (m) return { squares: 4, 'equilateral triangles': 6, 'regular hexagons': 3 }[m[1]] === val(q.answer) ? null : 'wrong number at a point'
    return 'unrecognised'
  },
  'y8-data-sample': (q, t) => {
    let m = t.match(/There are ([\d\s]+) \w+ at .*, (\d+) \w+ are chosen at random and surveyed\. What is the sample size/)
    if (m) return n(m[2]) < n(m[1]) && n(m[2]) === val(q.answer) ? null : 'wrong sample size'
    m = t.match(/There are ([\d\s]+) \w+ at .*, (all ([\d\s]+)|(\d+) of them) are surveyed/)
    if (m) {
      const census = !!m[3] && n(m[3]) === n(m[1])
      return mcRight(q.answer) === (census ? 'Census' : 'Sample') ? null : 'census/sample wrong'
    }
    m = t.match(/lists ([\d\s]+) students .* every (\d+)(st|nd|rd|th) student/)
    if (m) return n(m[1]) % n(m[2]) === 0 && n(m[1]) / n(m[2]) === val(q.answer) ? null : 'wrong systematic sample'
    if (/most reliable result/.test(t) && q.answer.kind === 'mc') {
      const sizes = q.answer.options.map((o) => o.match(/sample of (\d+)/)).filter(Boolean).map((x) => n(x![1]))
      return mcRight(q.answer) === `A random sample of ${Math.max(...sizes)} students` ? null : 'not the largest sample'
    }
    return 'fixed'
  },
}

for (const topic of ALL_TOPICS)
  for (const skill of topic.skills) {
    const check = CHECKS[skill.id]
    if (!check) continue
    for (const level of [1, 2, 3] as const)
      for (let i = 0; i < N; i++) {
        setSeed(1000 * level + i + 1)
        const q = skill.gen(level)
        const text = strip(q.prompt)
        const r = check(q, text)
        if (r === 'fixed') {
          fixed.set(`${skill.id} | ${text}`, mcRight(q.answer) ?? String(val(q.answer)))
          continue
        }
        if (r !== null) {
          failures++
          if (failures < 30) console.log(`FAIL ${skill.id} L${level}: ${r}\n   ${text}\n   answer: ${JSON.stringify(q.answer)}`)
          continue
        }
        checked[skill.id] = (checked[skill.id] ?? 0) + 1
      }
  }

const missing = Object.keys(CHECKS).filter((k) => !checked[k])
if (missing.length) {
  failures++
  console.log('Not found (run with STAGE1=1 STAGE2=1): ' + missing.join(', '))
}
console.log('Checked independently: ' + Object.entries(checked).map(([k, v]) => `${k} ${v}`).join(', '))
if (process.env.SHOW_FIXED) for (const [k, v] of fixed) console.log(`  fixed: ${k}  →  ${v}`)
console.log(`${fixed.size} different fixed-list questions (SHOW_FIXED=1 to list them)`)
if (failures) {
  console.log(`${failures} failures`)
  process.exit(1)
}
console.log('All variety checks passed')
