import { isRouteErrorResponse, useRouteError } from 'react-router'
import { NotFound } from '@/routes/not-found'

export function RootErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />
  }

  let message = 'An unexpected error occurred.'
  if (isRouteErrorResponse(error)) {
    message = `${error.status} ${error.statusText}`
  } else if (error instanceof Error) {
    message = error.message
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center gap-2 px-4">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground">{message}</p>
    </main>
  )
}
