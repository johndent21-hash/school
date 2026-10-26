import { useEffect, useState } from 'react'

/**
 * False on the server and during the first client render, true afterwards.
 * Pages are prerendered as static HTML, so anything that depends on the URL's search
 * params, the saved log-in or the device must wait until this is true.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}
