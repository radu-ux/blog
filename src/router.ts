import { createBrowserRouter } from 'react-router'
import { RootLayout } from '@/routes/root-layout'
import { RootErrorBoundary } from '@/routes/root-error-boundary'
import { Home } from '@/routes/home'
import { NotFound } from '@/routes/not-found'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    ErrorBoundary: RootErrorBoundary,
    children: [
      { index: true, Component: Home },
      { path: '*', Component: NotFound },
    ],
  },
])
