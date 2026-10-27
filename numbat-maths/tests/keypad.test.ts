// Every typed answer in Years 1–9 must be enterable with the on-screen keypad alone,
// and what the keypad produces must be marked correct.
// Simulates typing: the expected answer is split into keypad presses (digits plus the keys shown
// for that question); spaces in the expected answer are skipped unless a key types them.
// Usage: npx tsx tests/keypad.test.ts   (N questions per skill and level, default 60)
import { setSeed } from '../src/lib/maths/rand'
import { answerText, checkAnswer } from '../src/lib/maths/check'
import { padLayout } from '../src/lib/maths/keypad'
import { SECONDARY_TOPICS, STAGE1_TOPICS, STAGE2_TOPICS } from '../src/content/index'
import type { Level } from '../src/lib/maths/types'

const N = Number(process.env.N ?? 60)
let failures = 0
let checked = 0
const kinds: Record<string, number> = {}

/** Turn an expected answer into the text the keypad would produce, or null if a character has no key. */
function typeWith(target: string, inserts: string[]): string | null {
  // the keypad shows − and ×; the marker reads both the same as - and *
  const t = target.replace(/-/g, '−').replace(/\*/g, '×')
  const keys = [...inserts, ...'0123456789'.split('')].sort((a, b) => b.length - a.length)
  let out = ''
  let i = 0
  while (i < t.length) {
    const key = keys.find((k) => t.startsWith(k, i)) ?? keys.find((k) => k.trim() && t.startsWith(k.trim(), i))
    if (key) {
      out += key
      i += t.startsWith(key, i) ? key.length : key.trim().length
    } else if (t[i] === ' ') i++
    else return null
  }
  return out
}

for (const t of [...STAGE1_TOPICS, ...STAGE2_TOPICS, ...SECONDARY_TOPICS]) {
  for (const s of t.skills) {
    for (const lvl of [1, 2, 3] as Level[]) {
      for (let k = 0; k < N; k++) {
        setSeed(11 + k * 7919 + lvl * 104729 + s.id.length)
        const q = s.gen(lvl)
        const a = q.answer
        if (a.kind === 'mc') continue
        checked++
        kinds[a.kind] = (kinds[a.kind] ?? 0) + 1
        const lay = padLayout(a, t.year, q.prompt)
        const inserts = [...lay.extras, ...lay.symbols].map((x) => x.insert)
        const want = answerText(a)
        const typed = typeWith(want, inserts)
        const fail = (why: string) => {
          failures++
          if (failures <= 25) console.log(`FAIL ${s.id} L${lvl}: ${why} | answer "${want}" | keys ${JSON.stringify(inserts)}`)
        }
        if (typed === null) {
          fail('a character has no key')
          continue
        }
        const r = checkAnswer(a, typed)
        if (!r.correct || r.invalid) fail(`typed "${typed}" was marked ${r.invalid ? 'unreadable' : 'wrong'}${r.feedback ? ` (${r.feedback})` : ''}`)
        // every key on the pad must also be readable on its own in a sensible place: no key types a character the marker can't read
        for (const ins of inserts) {
          if (/[^0-9a-zA-Z.,:()^/+×−± ]/.test(ins)) fail(`key inserts an unexpected character ${JSON.stringify(ins)}`)
        }
      }
    }
  }
}

console.log(`${checked} typed answers checked`, kinds)
if (failures) {
  console.log(`${failures} failures`)
  process.exit(1)
}
console.log('All keypad checks passed')
