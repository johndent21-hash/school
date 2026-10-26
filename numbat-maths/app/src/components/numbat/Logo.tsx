/** Numbat Maths mark: a page of graph paper with the numbat's back stripes. */
export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
      <rect x="1" y="1" width="38" height="38" rx="10" className="fill-primary" />
      <path d="M8 14h24M8 20h24M8 26h24M14 8v24M20 8v24M26 8v24" className="stroke-primary-foreground" strokeOpacity="0.18" strokeWidth="1" />
      <path d="M9 29c3-9 9-14 17-14 3 0 5 1 6 3" className="stroke-primary-foreground" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M17 18l2 4M22 16l1.5 4.2M27 15.5l0.6 4.4" className="stroke-sun" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="31.5" cy="21" r="1.6" className="fill-primary-foreground" />
    </svg>
  )
}
