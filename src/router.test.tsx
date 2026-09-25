import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderApp } from '@/test/render-app'
import { routes } from '@/router'

describe('routes', () => {
  it('renders the Not Found page for an unknown URL, with the header present', () => {
    renderApp(routes, '/this-page-does-not-exist')

    expect(
      screen.getByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'blog' })).toBeInTheDocument()
  })

  it('renders the Home page at the index route', () => {
    renderApp(routes, '/')

    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument()
  })
})
