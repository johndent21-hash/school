// Checks the on-screen calculator's arithmetic against hand-worked values.
// Usage: npx tsx tests/calc.test.ts
import { calcDisplay, calculate, dmsText, fractionParts } from '../src/lib/maths/calc'

let failures = 0
const near = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b))

const CASES: [string, number][] = [
  ['2+3×4', 14],
  ['(2+3)×4', 20],
  ['10−4−3', 3],
  ['100÷5÷2', 10],
  ['2^3^2', 512], // right-associative, as on a scientific calculator
  ['−3²', -9],
  ['(−3)²', 9],
  ['2^−1', 0.5],
  ['10^−3', 0.001],
  ['3.2×10^5', 320000],
  ['√(9+16)', 5],
  ['√(144', 12], // closing bracket added
  ['√16+9', 13],
  ['2π', 2 * Math.PI],
  ['π×5²', 25 * Math.PI],
  ['2π×3×7', 42 * Math.PI],
  ['3(4+1)', 15],
  ['(1+2)(3+4)', 21],
  ['5√(4)', 10],
  ['sin(30)', 0.5],
  ['cos(60)', 0.5],
  ['tan(45)', 1],
  ['sin⁻¹(0.5)', 30],
  ['cos⁻¹(0.5)', 60],
  ['tan⁻¹(1)', 45],
  ['12×sin(35)', 12 * Math.sin((35 * Math.PI) / 180)],
  ['8÷tan(40)', 8 / Math.tan((40 * Math.PI) / 180)],
  ['√(6.2²+4.5²)', Math.sqrt(6.2 ** 2 + 4.5 ** 2)],
  ['.5+.25', 0.75],
  ['Ans×2', 14], // Ans = 7 below
  ['1500×0.045×3', 202.5],
  ['2000×(1+0.05)^3', 2000 * 1.05 ** 3],
]

for (const [expr, want] of CASES) {
  const r = calculate(expr, 7)
  if (!r.ok || !near(r.value, want)) {
    failures++
    console.log(`FAIL ${expr}: got ${r.ok ? r.value : r.message}, want ${want}`)
  }
}

const ERRORS: [string, string][] = [
  ['5÷0', 'Maths error'],
  ['√(−4)', 'Maths error'],
  ['tan(90)', 'Maths error'],
  ['sin⁻¹(2)', 'Maths error'],
  ['3+', 'Syntax error'],
  ['×3', 'Syntax error'],
  ['2)', 'Syntax error'],
  ['', 'Type a calculation'],
  ['.', 'Syntax error'],
  ['(−8)^(1÷3)', 'Maths error'],
]
for (const [expr, want] of ERRORS) {
  const r = calculate(expr)
  if (r.ok || r.message !== want) {
    failures++
    console.log(`FAIL ${expr}: got ${r.ok ? r.value : r.message}, want ${want}`)
  }
}

const SHOW: [number, string][] = [
  [0.1 + 0.2, '0.3'],
  [Math.sin(Math.PI / 6), '0.5'],
  [1 / 3, '0.3333333333'],
  [2 * Math.PI, '6.283185307'],
  [123456789012, '1.23456789 × 10^11'],
  [0.00000032, '3.2 × 10^-7'],
  [-42.5, '-42.5'],
]
for (const [x, want] of SHOW) {
  const got = calcDisplay(x).text
  if (got !== want) {
    failures++
    console.log(`FAIL display ${x}: got ${got}, want ${want}`)
  }
}

// Fractions keyed with the fraction keys (⟦n|d⟧ and ⟦w|n|d⟧) are worked out exactly
const EXACT: [string, string][] = [
  ['⟦2|3⟧+⟦1|4⟧', '11/12'],
  ['⟦2|1|3⟧×⟦3|4⟧', '7/4'],
  ['⟦−2|1|3⟧+1', '-4/3'], // −2⅓ + 1
  ['⟦3|4⟧÷⟦9|10⟧', '5/6'],
  ['⟦1|2⟧−⟦5|6⟧', '-1/3'],
  ['(⟦2|3⟧)²', '4/9'],
  ['⟦2|3⟧^−2', '9/4'],
  ['√(⟦9|16⟧)', '3/4'],
  ['0.75', '3/4'],
  ['⟦1.5|2⟧', '3/4'],
  ['1÷3×3', '1/1'],
  ['36°52′30″', '295/8'], // 36.875°
]
for (const [x, want] of EXACT) {
  const r = calculate(x)
  const got = r.ok && r.exact ? `${r.exact.n}/${r.exact.d}` : JSON.stringify(r)
  if (got !== want) {
    failures++
    console.log(`FAIL exact ${x}: got ${got}, want ${want}`)
  }
}
// π, √ of a non-square and trig give decimals only
for (const x of ['π×⟦1|2⟧', '√(2)', 'sin(30)']) {
  const r = calculate(x)
  if (!r.ok || r.exact) {
    failures++
    console.log(`FAIL ${x} should be a decimal only`)
  }
}
for (const [x, want] of [['⟦|3⟧', 'Fill in every box'], ['⟦3|0⟧', 'Maths error'], ['⟦2|⟧', 'Fill in every box']] as const) {
  const r = calculate(x)
  if (r.ok || r.message !== want) {
    failures++
    console.log(`FAIL ${x}: want ${want}`)
  }
}
const parts = fractionParts({ n: -11n, d: 4n })
if (!(parts.neg && parts.whole === 2n && parts.rest === 3n)) {
  failures++
  console.log('FAIL mixed parts of −11/4')
}
for (const [x, want] of [[36.86989764584402, '36°52′11.63″'], [59.99999, '59°59′59.96″'], [-12.5, '−12°30′0″']] as const) {
  if (dmsText(x) !== want) {
    failures++
    console.log(`FAIL dms ${x}: ${dmsText(x)}`)
  }
}
const ansExact = calculate('Ans+1', { value: 0.75, exact: { n: 3n, d: 4n } })
if (!ansExact.ok || ansExact.exact?.n !== 7n || ansExact.exact.d !== 4n) {
  failures++
  console.log('FAIL Ans keeps the exact fraction')
}

console.log(`${CASES.length + ERRORS.length + SHOW.length + EXACT.length + 10} calculator checks`)
if (failures) {
  console.log(`${failures} failures`)
  process.exit(1)
}
console.log('All calculator checks passed')
