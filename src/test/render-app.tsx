import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router'

export function renderApp(routes: RouteObject[], initialUrl: string) {
  const router = createMemoryRouter(routes, { initialEntries: [initialUrl] })
  return render(<RouterProvider router={router} />)
}
