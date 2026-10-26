import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router'
import { routeTree } from './src/routeTree.gen'
import { NotFound } from './src/components/not-found'
import { ErrorBoundary } from './src/components/error-boundary'

const router = createRouter({
  routeTree,
  history: createMemoryHistory({ initialEntries: ['/'] }),
  defaultNotFoundComponent: NotFound,
  defaultErrorComponent: ErrorBoundary,
})
let last = ''
router.subscribe('onResolved', ({ toLocation }) => {
  if (toLocation.pathname !== last) window.scrollTo(0, 0)
  last = toLocation.pathname
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
