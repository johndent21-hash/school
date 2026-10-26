// Like Convex's useQuery, but a server error comes back as a value instead of crashing the page.
import { useMemo } from 'react'
import { useQueries } from 'convex/react'
import { getFunctionName, type FunctionReference } from 'convex/server'

type Requests = Record<string, { query: FunctionReference<'query'>; args: Record<string, any> }>

export function useSafeQuery<Q extends FunctionReference<'query'>>(
  query: Q,
  args: Q['_args'] | 'skip',
): { data: Q['_returnType'] | undefined; error: Error | null } {
  const name = getFunctionName(query)
  const key = args === 'skip' ? 'skip' : JSON.stringify(args)
  // useQueries resubscribes whenever this object changes, so keep it stable between renders
  const queries = useMemo(() => {
    const requests: Requests = {}
    if (args !== 'skip') requests.q = { query, args: args as Record<string, any> }
    return requests
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, key])
  const value = useQueries(queries).q
  if (value instanceof Error) return { data: undefined, error: value }
  return { data: value, error: null }
}
