// Root for the stand-alone preview: a plain single-page app, no server rendering.
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import AppConvexProvider from '@/components/convex-client-provider'
import { SessionProvider } from '@/lib/session'
import '../styles.css'

export const Route = createRootRoute({ component: Root })

function Root() {
  return (
    <AppConvexProvider>
      <SessionProvider>
        <Outlet />
      </SessionProvider>
      <Toaster position="top-center" theme="system" />
    </AppConvexProvider>
  )
}
