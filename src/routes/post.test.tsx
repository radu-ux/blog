import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderApp } from '@/test/render-app'
import { createRoutes } from '@/router'
import { postLoader, Post } from '@/routes/post'

vi.mock('virtual:posts', () => ({
  posts: {
    'hello-world': {
      metadata: {
        slug: 'hello-world',
        title: 'Hello World',
        description: 'A description of hello world',
        date: '2024-01-01',
        draft: false,
      },
      load: () => Promise.resolve({ default: () => <p>Post body</p> }),
    },
  },
}))

function postRoutes() {
  return createRoutes([
    { path: 'posts/:slug', loader: postLoader, Component: Post },
  ])
}

describe('Post route', () => {
  it('renders the header and body for a known Slug', async () => {
    renderApp(postRoutes(), '/posts/hello-world')

    expect(
      await screen.findByRole('heading', { name: 'Hello World' }),
    ).toBeInTheDocument()
    expect(screen.getByText('2024-01-01')).toBeInTheDocument()
    expect(screen.getByText('A description of hello world')).toBeInTheDocument()
    expect(screen.getByText('Post body')).toBeInTheDocument()
    expect(document.title).toBe('Hello World')
    expect(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute('content'),
    ).toBe('A description of hello world')
  })

  it('renders Not Found inside the layout for an unknown Slug', async () => {
    renderApp(postRoutes(), '/posts/does-not-exist')

    expect(
      await screen.findByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'blog' })).toBeInTheDocument()
  })
})
