import { createBrowserRouter, type RouteObject } from 'react-router'
import { RootLayout } from '@/routes/root-layout'
import { RootErrorBoundary } from '@/routes/root-error-boundary'
import { Home } from '@/routes/home'
import { NotFound } from '@/routes/not-found'
import { Post, postLoader } from '@/routes/post'

export function createRoutes(children: RouteObject[]): RouteObject[] {
  return [
    {
      path: '/',
      Component: RootLayout,
      children: [
        {
          ErrorBoundary: RootErrorBoundary,
          children,
        },
      ],
    },
  ]
}

export const routes = createRoutes([
  { index: true, Component: Home },
  { path: 'posts/:slug', loader: postLoader, Component: Post },
  { path: '*', Component: NotFound },
])

export const router = createBrowserRouter(routes)
