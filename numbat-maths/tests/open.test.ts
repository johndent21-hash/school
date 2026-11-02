// Checks marking of questions with many right answers (answer kind "open").
// Usage: npx tsx tests/open.test.ts
import { checkAnswer, signedLiterals } from '../src/lib/maths/check'
import type { Answer } from '../src/lib/maths/types'

let failures = 0
const expect = (what: string, a: Answer, input: string, want: 'right' | 'wrong' | 'invalid') => {
  const r = checkAnswer(a, input)
  const got = r.invalid ? 'invalid' : r.correct ? 'right' : 'wrong'
  if (got !== want) {
    failures++
    console.log(`FAIL ${what}: "${input}" was ${got}, want ${want} (${r.feedback ?? ''})`)
  }
}

const sum7: Answer = { kind: 'open', rule: { type: 'blanks', template: '_ + _ = 7', negative: true }, example: '-3, 10' }
expect('sum 7', sum7, '−3, 10', 'right')
expect('sum 7 other order', sum7, '10, -3', 'right')
expect('sum 7 with "and"', sum7, '−1 and 8', 'right')
expect('sum 7 wrong', sum7, '−3, 9', 'wrong')
expect('sum 7 no negative', sum7, '3, 4', 'invalid')
expect('sum 7 one number', sum7, '7', 'invalid')
expect('sum 7 decimals', sum7, '-0.5, 7.5', 'invalid')
const three: Answer = { kind: 'open', rule: { type: 'blanks', template: '_ + _ + _ = 0', noZero: true }, example: '1, 2, -3' }
expect('three no zero', three, '5, -2, -3', 'right')
expect('three with zero', three, '0, 4, -4', 'invalid')
const prod: Answer = { kind: 'open', rule: { type: 'blanks', template: '_ × _ = −28', negative: true }, example: '4, -7' }
expect('product', prod, '−4, 7', 'right')
expect('product wrong', prod, '−4, −7', 'wrong')
const quot: Answer = { kind: 'open', rule: { type: 'blanks', template: '_ ÷ _ = −4', negative: true }, example: '-8, 2' }
expect('quotient', quot, '20, −5', 'right')
expect('divide by zero', quot, '-4, 0', 'wrong')
const sub: Answer = { kind: 'open', rule: { type: 'blanks', template: '_ − _ = −11', negative: true }, example: '-1, 10' }
expect('difference', sub, '−20, −9', 'right')

const use: Answer = { kind: 'open', rule: { type: 'use', numbers: [4, -8, 3], target: -20 }, example: '4 + (-8) * 3' }
expect('use', use, '4 + (−8) × 3', 'right')
expect('use other way', use, '(−8) × 3 + 4', 'right')
expect('use written as subtraction', use, '4 − 8 × 3', 'invalid')
expect('use wrong value', use, '4 × (−8) + 3', 'wrong')
expect('use extra number', use, '4 + (−8) × 3 + 0', 'invalid')
expect('use with = target', use, '4 + (−8) × 3 = −20', 'right')
const use2: Answer = { kind: 'open', rule: { type: 'use', numbers: [4, -8, 3], target: 8 }, example: '(4 + 3 - -8) ...' }
void use2
const brackets: Answer = { kind: 'open', rule: { type: 'brackets', expr: '−4 × 7 − 2 + (−3)', target: -23 }, example: '-4 * (7 - 2) + (-3)' }
expect('brackets', brackets, '−4 × (7 − 2) + (−3)', 'right')
expect('brackets wrong place', brackets, '(−4 × 7 − 2) + (−3)', 'wrong')
expect('brackets changed numbers', brackets, '−4 × (7 − 3) + (−3)', 'invalid')

const lits = (s: string) => JSON.stringify(signedLiterals(s))
for (const [s, want] of [
  ['4 + (−8) × 3', '[4,-8,3]'],
  ['−8 × 3 + 4', '[-8,3,4]'],
  ['4 − 8', '[4,8]'],
  ['4 × −8', '[4,-8]'],
  ['[5 − (−10)] ÷ 3', '[5,-10,3]'],
] as const) {
  if (lits(s) !== want) {
    failures++
    console.log(`FAIL literals ${s}: ${lits(s)} want ${want}`)
  }
}

if (failures) {
  console.log(`${failures} failures`)
  process.exit(1)
}
console.log('All open-answer checks passed')
