import { describe, expect, it } from 'vitest'
import { collectPosts } from './collect-posts.ts'

describe('collectPosts', () => {
  it('derives the Slug from the filename for a valid Post', () => {
    const { posts, errors } = collectPosts(
      [
        {
          filename: 'hello-world.mdx',
          contents:
            '---\ntitle: Hello World\ndescription: A description\ndate: 2024-01-01\n---\n\nBody',
        },
      ],
      { mode: 'production' },
    )

    expect(errors).toEqual([])
    expect(posts).toEqual({
      'hello-world': {
        slug: 'hello-world',
        title: 'Hello World',
        description: 'A description',
        date: '2024-01-01',
        draft: false,
      },
    })
  })

  it('passes through an optional author', () => {
    const { posts } = collectPosts(
      [
        {
          filename: 'hello-world.mdx',
          contents:
            '---\ntitle: Hello World\ndescription: A description\ndate: 2024-01-01\nauthor: Ada Lovelace\n---\n',
        },
      ],
      { mode: 'production' },
    )

    expect(posts['hello-world']?.author).toBe('Ada Lovelace')
  })

  it('ignores non-MDX files', () => {
    const { posts, errors } = collectPosts(
      [{ filename: 'notes.txt', contents: 'irrelevant' }],
      { mode: 'production' },
    )

    expect(posts).toEqual({})
    expect(errors).toEqual([])
  })

  it('collects an error for a Post missing required fields', () => {
    const { posts, errors } = collectPosts(
      [{ filename: 'broken.mdx', contents: '---\ntitle: Broken\n---\n' }],
      { mode: 'production' },
    )

    expect(posts).toEqual({})
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('broken.mdx')
    expect(errors[0]).toContain('description')
    expect(errors[0]).toContain('date')
  })

  it('collects an error for ill-typed required fields', () => {
    const { posts, errors } = collectPosts(
      [
        {
          filename: 'ill-typed.mdx',
          contents:
            '---\ntitle: 42\ndescription: true\ndate: 2024-01-01\n---\n',
        },
      ],
      { mode: 'production' },
    )

    expect(posts).toEqual({})
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('title')
    expect(errors[0]).toContain('description')
  })

  it('collects an error for a malformed date', () => {
    const { posts, errors } = collectPosts(
      [
        {
          filename: 'bad-date.mdx',
          contents:
            '---\ntitle: Bad Date\ndescription: A description\ndate: not-a-date\n---\n',
        },
      ],
      { mode: 'production' },
    )

    expect(posts).toEqual({})
    expect(errors).toEqual([
      'bad-date.mdx: date must be an ISO YYYY-MM-DD date',
    ])
  })

  it('collects an error for a non-URL-safe filename', () => {
    const { posts, errors } = collectPosts(
      [
        {
          filename: 'Not URL Safe.mdx',
          contents:
            '---\ntitle: Title\ndescription: A description\ndate: 2024-01-01\n---\n',
        },
      ],
      { mode: 'production' },
    )

    expect(posts).toEqual({})
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('Not URL Safe.mdx')
    expect(errors[0]).toContain('not URL-safe')
  })

  it('collects an error for unparseable front-matter', () => {
    const { posts, errors } = collectPosts(
      [
        {
          filename: 'unparseable.mdx',
          contents: '---\ntitle: [Unclosed\n---\nBody',
        },
      ],
      { mode: 'production' },
    )

    expect(posts).toEqual({})
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('unparseable.mdx')
    expect(errors[0]).toContain('front-matter failed to parse')
  })

  it('collects multiple errors across multiple invalid Posts', () => {
    const { errors } = collectPosts(
      [
        { filename: 'broken-one.mdx', contents: '---\ntitle: One\n---\n' },
        { filename: 'broken-two.mdx', contents: '---\ntitle: Two\n---\n' },
      ],
      { mode: 'production' },
    )

    expect(errors).toHaveLength(2)
  })

  it('excludes a Draft in production mode and includes it flagged in development mode', () => {
    const files = [
      {
        filename: 'wip.mdx',
        contents:
          '---\ntitle: WIP\ndescription: A description\ndate: 2024-01-01\ndraft: true\n---\n',
      },
    ]

    expect(collectPosts(files, { mode: 'production' }).posts).toEqual({})
    expect(collectPosts(files, { mode: 'development' }).posts).toEqual({
      wip: {
        slug: 'wip',
        title: 'WIP',
        description: 'A description',
        date: '2024-01-01',
        draft: true,
      },
    })
  })
})
