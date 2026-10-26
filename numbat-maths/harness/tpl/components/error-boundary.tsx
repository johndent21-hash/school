import { useRouter, type ErrorComponentProps } from '@tanstack/react-router'
export function ErrorBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  const message = error instanceof Error ? error.message : String(error)
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 p-6 text-center">
      <h1 className="text-4xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground max-w-md break-words" data-testid="error-message">{message}</p>
      <button onClick={() => router.invalidate()}>Retry</button>
    </div>
  )
}
