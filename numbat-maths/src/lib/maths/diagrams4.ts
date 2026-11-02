// Diagrams for integers: number lines with negatives, vertical temperature and height scales,
// a BCE/CE timeline and column graphs that go below zero. Drawn with the same CSS classes as
// the other diagrams so they follow the theme.

import { num } from './format'
import { dot, line, svg, text } from './diagrams'

type P = [number, number]
const f = (x: number) => Number(x.toFixed(2))

export interface IntLineOpts {
  min: number
  max: number
  /** a tick every `step` */
  step: number
  /** values that get a number underneath; default: every tick */
  labels?: number[]
  /** values whose label is replaced by "?" (for "which number goes here?") */
  ask?: number
  /** lettered arrows pointing down at values (for "what number does arrow B show?") */
  arrows?: { value: number; label: string }[]
  /** a circled letter sitting on the line (for "where will S be if it moves …") */
  marker?: { value: number; label: string }
  /** filled dots on the line */
  dots?: number[]
  /** hops of one step each, from `from` to `to`, with an arrow head on the last hop */
  hops?: { from: number; to: number }
  /** words at the two ends, e.g. ['Negative', 'Positive'] */
  ends?: [string, string]
  /** arrow heads at both ends (default) or only on the right (whole numbers) */
  rightOnly?: boolean
}

/** A horizontal number line for integers. */
export function intLine(o: IntLineOpts): string {
  const W = 380
  const left = 28
  const right = W - 28
  const top = o.arrows?.length ? 46 : o.hops ? 44 : o.marker ? 40 : o.ends ? 26 : 16
  const y = top + 14
  const X = (v: number) => left + ((v - o.min) / (o.max - o.min)) * (right - left)
  let body = line([left - 14, y], [right + 14, y], 'axis')
  body += `<path class="ln" d="M${right + 14},${y} l-8,-5 M${right + 14},${y} l-8,5"/>`
  if (!o.rightOnly) body += `<path class="ln" d="M${left - 14},${y} l8,-5 M${left - 14},${y} l8,5"/>`
  const n = Math.round((o.max - o.min) / o.step)
  for (let i = 0; i <= n; i++) {
    const v = o.min + i * o.step
    body += line([X(v), y - 7], [X(v), y + 7], 'axis')
    const labelled = o.labels ? o.labels.some((l) => Math.abs(l - v) < 1e-9) : true
    if (o.ask !== undefined && Math.abs(o.ask - v) < 1e-9) body += text([X(v), y + 22], '?', 'dl small hl')
    else if (labelled) body += text([X(v), y + 22], num(v), n > 16 ? 'dl tiny' : 'dl small')
  }
  for (const a of o.arrows ?? []) {
    body += `<path class="nlmark" d="M${f(X(a.value))},${y - 9} l-5,-9 h10 Z"/>`
    body += line([X(a.value), y - 18], [X(a.value), y - 30], 'ln thin')
    body += text([X(a.value), y - 40], a.label, 'dl small hl')
  }
  if (o.marker) {
    body += `<circle class="nlring" cx="${f(X(o.marker.value))}" cy="${y - 22}" r="10"/>`
    body += text([X(o.marker.value), y - 22], o.marker.label, 'dl small it')
    body += dot([X(o.marker.value), y], 4, 'pt hlfill')
  }
  for (const d of o.dots ?? []) body += dot([X(d), y], 4.5, 'pt hlfill')
  if (o.hops && o.hops.from !== o.hops.to) {
    const dir = Math.sign(o.hops.to - o.hops.from)
    let path = ''
    for (let v = o.hops.from; v !== o.hops.to; v += dir) {
      const a = X(v)
      const b = X(v + dir)
      path += `M${f(a)},${y - 4} Q${f((a + b) / 2)},${y - 26} ${f(b)},${y - 4} `
    }
    body += `<path class="arc" d="${path}"/>`
    const end = X(o.hops.to)
    body += `<path class="nlmark" d="M${f(end)},${y - 3} l${-dir * 7},-7 l${dir * 1},8 Z"/>`
    body += dot([X(o.hops.from), y], 4, 'pt hlfill')
  }
  if (o.ends) {
    body += text([left, 10], o.ends[0], 'dl tiny hl', 'start')
    body += text([right, 10], o.ends[1], 'dl tiny hl', 'end')
  }
  return svg(W, y + 36, body, 'Number line', 400)
}

/** A vertical scale (thermometer or heights above and below sea level) with labelled marks beside it. */
export function vScale(o: {
  min: number
  max: number
  step: number
  unit: string
  /** label every k-th tick (default every tick) */
  labelEvery?: number
  marks?: { value: number; label: string }[]
  /** a shaded band beside the scale, e.g. an iceberg from +30 m to −90 m */
  band?: { from: number; to: number }
  /** shade the region below 0 as water */
  sea?: boolean
}): string {
  const top = 16
  const H = 300
  const axisX = 210
  const Y = (v: number) => top + ((o.max - v) / (o.max - o.min)) * H
  let body = ''
  if (o.sea) body += `<rect class="water" x="96" y="${f(Y(0))}" width="${axisX - 104}" height="${f(Y(o.min) - Y(0))}"/>`
  if (o.band) {
    const y1 = Y(Math.max(o.band.from, o.band.to))
    const y2 = Y(Math.min(o.band.from, o.band.to))
    body += `<rect class="sh" x="122" y="${f(y1)}" width="56" height="${f(y2 - y1)}" rx="10"/>`
  }
  if (o.sea) body += line([96, Y(0)], [axisX, Y(0)], 'ln thin') + text([100, Y(0) - 10], 'sea level', 'dl tiny', 'start')
  body += line([axisX, Y(o.max) - 6], [axisX, Y(o.min) + 6], 'axis')
  body += `<path class="ln" d="M${axisX},${f(Y(o.max) - 10)} l-5,8 M${axisX},${f(Y(o.max) - 10)} l5,8"/>`
  const n = Math.round((o.max - o.min) / o.step)
  const every = o.labelEvery ?? 1
  for (let i = 0; i <= n; i++) {
    const v = o.max - i * o.step
    body += line([axisX - 6, Y(v)], [axisX + 6, Y(v)], 'axis')
    if (i % every === 0) body += text([axisX + 12, Y(v)], `${v > 0 && o.sea ? '+' : ''}${num(v)} ${o.unit}`, 'dl tiny', 'start')
  }
  for (const m of o.marks ?? []) {
    body += line([axisX - 30, Y(m.value)], [axisX - 8, Y(m.value)], 'ln thin')
    body += text([axisX - 34, Y(m.value)], m.label, 'dl tiny hl', 'end')
  }
  return svg(320, H + top * 2, body, o.sea ? 'Height scale' : 'Temperature scale', 320)
}

/** A timeline from `min` BCE to `max` CE with lettered events above it. Years BCE are drawn left of 0. */
export function timeline(span: number, step: number, events: { year: number; label: string }[]): string {
  const W = 380
  const left = 30
  const right = W - 30
  const y = 58
  const X = (v: number) => left + ((v + span) / (2 * span)) * (right - left)
  let body = line([left - 12, y], [right + 12, y], 'axis')
  body += `<path class="ln" d="M${right + 12},${y} l-8,-5 M${right + 12},${y} l-8,5 M${left - 12},${y} l8,-5 M${left - 12},${y} l8,5"/>`
  for (let v = -span; v <= span + 1e-9; v += step) body += line([X(v), y - 6], [X(v), y + 6], 'axis')
  body += text([X(-span), y + 22], `${span} BCE`, 'dl tiny')
  body += text([X(0), y + 22], '0', 'dl tiny')
  body += text([X(span), y + 22], `${span} CE`, 'dl tiny')
  body += text([left - 12, y + 40], 'BCE', 'dl tiny hl', 'start')
  body += text([right + 12, y + 40], 'CE', 'dl tiny hl', 'end')
  events.forEach((e, i) => {
    const lift = i % 2 === 0 ? 18 : 36
    body += line([X(e.year), y - 4], [X(e.year), y - lift + 6], 'ln thin')
    body += text([X(e.year), y - lift], e.label, 'dl small hl')
  })
  return svg(W, y + 54, body, 'Timeline', 400)
}

/** A column graph whose columns can go below zero (profit and loss). */
export function signedColumns(cats: string[], vals: number[], step: number, unit: string, title = ''): string {
  const W = 380
  const left = 58
  const right = W - 14
  const top = title ? 34 : 16
  const H = 210
  const hi = Math.max(step, Math.ceil(Math.max(...vals) / step) * step)
  const lo = Math.min(-step, Math.floor(Math.min(...vals) / step) * step)
  const Y = (v: number) => top + ((hi - v) / (hi - lo)) * H
  let body = title ? text([(left + right) / 2, 14], title, 'dl small') : ''
  for (let v = lo; v <= hi + 1e-9; v += step) {
    body += line([left, Y(v)], [right, Y(v)], v === 0 ? 'axis' : 'grid')
    body += text([left - 8, Y(v)], num(v), 'dl tiny', 'end')
  }
  body += line([left, Y(hi)], [left, Y(lo)], 'axis')
  body += text([14, top + H / 2], unit, 'dl tiny', 'middle').replace('<text ', `<text transform="rotate(-90 14 ${f(top + H / 2)})" `)
  const slot = (right - left) / cats.length
  cats.forEach((c, i) => {
    const x = left + slot * i + slot * 0.2
    const w = slot * 0.6
    const v = vals[i]
    const y1 = Y(Math.max(v, 0))
    const y2 = Y(Math.min(v, 0))
    body += `<rect class="bar" x="${f(x)}" y="${f(y1)}" width="${f(w)}" height="${f(Math.max(1, y2 - y1))}"/>`
    // the year sits on the opposite side of the zero line from the column
    body += text([x + w / 2, v >= 0 ? Y(0) + 13 : Y(0) - 11], c, 'dl tiny')
  })
  return svg(W, top + H + 18, body, title || 'Column graph', 400)
}

