import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderApp } from '@/test/render-app'
import { createRoutes } from '@/router'

function ThrowingComponent(): never {
  throw new Error('Boom')
}

describe('RootErrorBoundary', () => {
  it('renders an error thrown by a child route inside the layout, with the header present', () => {
    renderApp(createRoutes([{ index: true, Component: ThrowingComponent }]), '/')

    expect(
      screen.getByRole('heading', { name: 'Something went wrong' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'blog' })).toBeInTheDocument()
  })

  it('renders the Not Found UI for a 404 route error response', async () => {
    renderApp(
      createRoutes([
        {
          index: true,
          loader: () => {
            throw new Response('Not Found', { status: 404 })
          },
          Component: () => null,
        },
      ]),
      '/',
    )

    expect(
      await screen.findByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'blog' })).toBeInTheDocument()
  })
})
