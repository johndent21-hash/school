// Small charts for the teacher pages: weekly columns, a running-total line and stat tiles.
// One series each (so no legend: the title names it), thin marks, hairline grid, a hover and
// keyboard tooltip on every week, and a table view of the same numbers.
import { useCallback, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Table2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface WeekValue {
  start: number
  value: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const weekLabel = (t: number) => {
  const d = new Date(t)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

/** A callback ref that tracks the element's width, including after it is re-created. */
function useWidth(): [(el: HTMLElement | null) => void, number] {
  const [w, setW] = useState(0)
  const ro = useRef<ResizeObserver | null>(null)
  const ref = useCallback((el: HTMLElement | null) => {
    ro.current?.disconnect()
    if (!el) return
    setW(Math.floor(el.getBoundingClientRect().width))
    ro.current = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)))
    ro.current.observe(el)
  }, [])
  return [ref, w]
}

/** Clean ticks from 0: steps of 1, 2, 5, 10, 20, 50 ... with at most 5 intervals. */
function niceTicks(max: number): number[] {
  const top = Math.max(1, max)
  const steps = [1, 2, 5]
  let mag = 1
  for (;;) {
    for (const s of steps) {
      const step = s * mag
      if (top / step <= 5) {
        const n = Math.ceil(top / step)
        return Array.from({ length: n + 1 }, (_, i) => i * step)
      }
    }
    mag *= 10
  }
}

const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}K` : String(n))

const PLOT_H = 170
const AXIS_H = 26
const LEFT = 34
const RIGHT = 14
const TOP = 22

interface ChartProps {
  title: string
  subtitle?: string
  data: WeekValue[]
  /** e.g. "sets" — used in tooltips and the table */
  unit: string
  /** label for the last week, which is still going */
  currentLabel?: string
}

function Frame({ title, subtitle, data, unit, children }: ChartProps & { children: (w: number) => React.ReactNode }) {
  const [ref, w] = useWidth()
  const [table, setTable] = useState(false)
  return (
    <figure className="panel chart-card grid gap-2 p-4">
      <figcaption className="flex flex-wrap items-start justify-between gap-2">
        <span>
          <span className="block font-display text-lg font-semibold">{title}</span>
          {subtitle && <span className="block text-sm text-muted-foreground">{subtitle}</span>}
        </span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTable(!table)} aria-pressed={table}>
          <Table2 size={15} aria-hidden="true" /> {table ? 'Chart' : 'Table'}
        </button>
      </figcaption>
      {table ? (
        <div className="max-h-72 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground">
              <tr>
                <th className="py-1 pr-3">Week starting</th>
                <th className="py-1 text-right">{unit[0].toUpperCase() + unit.slice(1)}</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {data.map((d, i) => (
                <tr key={d.start} className="border-t border-border">
                  <td className="py-1 pr-3">
                    {weekLabel(d.start)}
                    {i === data.length - 1 ? ' (this week so far)' : ''}
                  </td>
                  <td className="py-1 text-right">{d.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div ref={ref} className="relative" style={{ height: PLOT_H + AXIS_H + TOP }}>
          {w > 0 && children(w)}
        </div>
      )}
    </figure>
  )
}

function Tooltip({ x, y, w, value, label }: { x: number; y: number; w: number; value: string; label: string }) {
  const left = Math.max(4, Math.min(w - 150, x - 75))
  return (
    <div className="chart-tip" style={{ left, top: Math.max(0, y - 52) }} role="status">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function XLabels({ data, x, band, currentLabel }: { data: WeekValue[]; x: (i: number) => number; band: number; currentLabel: string }) {
  const every = band >= 46 ? 1 : band >= 24 ? 2 : 3
  return (
    <>
      {data.map((d, i) => {
        const last = i === data.length - 1
        if (!last && (data.length - 1 - i) % every !== 0) return null
        return (
          <text key={d.start} x={x(i)} y={TOP + PLOT_H + 17} textAnchor={last ? 'end' : 'middle'} dx={last ? band / 2 - 2 : 0} className="chart-axis">
            {last ? currentLabel : weekLabel(d.start)}
          </text>
        )
      })}
    </>
  )
}

function Grid({ ticks, y, w }: { ticks: number[]; y: (v: number) => number; w: number }) {
  return (
    <>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={LEFT} x2={w - RIGHT} y1={y(t)} y2={y(t)} className={t === 0 ? 'chart-base' : 'chart-grid'} />
          <text x={LEFT - 6} y={y(t)} dy="0.32em" textAnchor="end" className="chart-axis tabular-nums">
            {compact(t)}
          </text>
        </g>
      ))}
    </>
  )
}

/** Columns, one per week. The latest column is labelled with its value. */
export function WeekColumns(props: ChartProps) {
  const [hover, setHover] = useState<number | null>(null)
  const { data, unit, currentLabel = 'This week' } = props
  return (
    <Frame {...props}>
      {(w) => {
        const ticks = niceTicks(Math.max(...data.map((d) => d.value)))
        const top = ticks[ticks.length - 1]
        const band = (w - LEFT - RIGHT) / data.length
        const bw = Math.max(4, Math.min(24, band * 0.62))
        const x = (i: number) => LEFT + band * (i + 0.5)
        const y = (v: number) => TOP + PLOT_H - (v / top) * PLOT_H
        const r = Math.min(4, bw / 2)
        const bar = (i: number, v: number) => {
          const x0 = x(i) - bw / 2
          const y0 = y(v)
          const h = TOP + PLOT_H - y0
          if (h <= 0) return ''
          const rr = Math.min(r, h)
          return `M${x0},${TOP + PLOT_H}V${y0 + rr}Q${x0},${y0} ${x0 + rr},${y0}H${x0 + bw - rr}Q${x0 + bw},${y0} ${x0 + bw},${y0 + rr}V${TOP + PLOT_H}Z`
        }
        const last = data.length - 1
        return (
          <>
            <svg width={w} height={PLOT_H + AXIS_H + TOP} role="img" aria-label={`${props.title}: ${data.map((d) => `week of ${weekLabel(d.start)} ${d.value}`).join(', ')}`}>
              <Grid ticks={ticks} y={y} w={w} />
              {data.map((d, i) => (
                <path key={d.start} d={bar(i, d.value)} className={cn('chart-bar', hover !== null && hover !== i && 'is-dim')} />
              ))}
              <text x={x(last)} y={y(data[last].value) - 6} textAnchor="middle" className="chart-value">
                {data[last].value}
              </text>
              <XLabels data={data} x={x} band={band} currentLabel={currentLabel} />
              {data.map((d, i) => (
                <rect
                  key={`hit${d.start}`}
                  x={LEFT + band * i}
                  y={TOP}
                  width={band}
                  height={PLOT_H}
                  fill="transparent"
                  tabIndex={0}
                  aria-label={`Week of ${weekLabel(d.start)}: ${d.value} ${unit}`}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  className="chart-hit"
                />
              ))}
            </svg>
            {hover !== null && (
              <Tooltip x={x(hover)} y={y(data[hover].value)} w={w} value={`${data[hover].value} ${unit}`} label={`Week of ${weekLabel(data[hover].start)}${hover === last ? ' (so far)' : ''}`} />
            )}
          </>
        )
      }}
    </Frame>
  )
}

/** A running total over the weeks: 2px line, soft area wash, labelled end point, crosshair on hover. */
export function WeekLine(props: ChartProps) {
  const [hover, setHover] = useState<number | null>(null)
  const { data, unit, currentLabel = 'This week' } = props
  return (
    <Frame {...props}>
      {(w) => {
        const ticks = niceTicks(Math.max(...data.map((d) => d.value)))
        const top = ticks[ticks.length - 1]
        const band = (w - LEFT - RIGHT) / data.length
        const x = (i: number) => LEFT + band * (i + 0.5)
        const y = (v: number) => TOP + PLOT_H - (v / top) * PLOT_H
        const pts = data.map((d, i) => `${x(i)},${y(d.value)}`)
        const last = data.length - 1
        const nearest = (px: number) => Math.max(0, Math.min(last, Math.round((px - LEFT) / band - 0.5)))
        return (
          <>
            <svg
              width={w}
              height={PLOT_H + AXIS_H + TOP}
              role="img"
              aria-label={`${props.title}: ${data.map((d) => `week of ${weekLabel(d.start)} ${d.value}`).join(', ')}`}
              onPointerMove={(e) => setHover(nearest(e.clientX - e.currentTarget.getBoundingClientRect().left))}
              onPointerLeave={() => setHover(null)}
            >
              <Grid ticks={ticks} y={y} w={w} />
              <polygon points={`${x(0)},${TOP + PLOT_H} ${pts.join(' ')} ${x(last)},${TOP + PLOT_H}`} className="chart-area" />
              <polyline points={pts.join(' ')} className="chart-line" />
              {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={TOP} y2={TOP + PLOT_H} className="chart-cross" />}
              {hover !== null && hover !== last && <circle cx={x(hover)} cy={y(data[hover].value)} r={4.5} className="chart-dot" />}
              <circle cx={x(last)} cy={y(data[last].value)} r={4.5} className="chart-dot" />
              <text x={x(last)} y={y(data[last].value) - 10} textAnchor="end" className="chart-value">
                {data[last].value}
              </text>
              <XLabels data={data} x={x} band={band} currentLabel={currentLabel} />
              <rect
                x={LEFT}
                y={TOP}
                width={w - LEFT - RIGHT}
                height={PLOT_H}
                fill="transparent"
                tabIndex={0}
                className="chart-hit"
                aria-label={`${props.title}. Use the arrow keys to read each week.`}
                onFocus={() => setHover(last)}
                onBlur={() => setHover(null)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') setHover((h) => Math.max(0, (h ?? last) - 1))
                  if (e.key === 'ArrowRight') setHover((h) => Math.min(last, (h ?? last) + 1))
                }}
              />
            </svg>
            {hover !== null && (
              <Tooltip x={x(hover)} y={y(data[hover].value)} w={w} value={`${data[hover].value} ${unit}`} label={`End of the week of ${weekLabel(data[hover].start)}${hover === last ? ' (so far)' : ''}`} />
            )}
          </>
        )
      }}
    </Frame>
  )
}

/** A headline number with an optional comparison. */
export function StatTile({
  label,
  value,
  sub,
  delta,
}: {
  label: string
  value: string
  sub?: string
  delta?: { amount: number; text: string; upIsGood?: boolean } | null
}) {
  const good = delta ? (delta.upIsGood ?? true) === delta.amount > 0 : false
  return (
    <div className="panel grid content-start gap-1 p-4">
      <p className="text-sm font-bold text-muted-foreground">{label}</p>
      <p className="stat-value">{value}</p>
      {delta && delta.amount !== 0 && (
        <p className={cn('flex items-center gap-1 text-sm font-bold', good ? 'text-success' : 'text-warning')}>
          {delta.amount > 0 ? <ArrowUp size={14} aria-hidden="true" /> : <ArrowDown size={14} aria-hidden="true" />}
          {delta.text}
        </p>
      )}
      {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
    </div>
  )
}
