import matter from 'gray-matter'

export const MDX_EXTENSION = '.mdx'
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export type Mode = 'development' | 'production'

export interface PostFile {
  filename: string
  contents: string
}

export interface PostMetadata {
  slug: string
  title: string
  description: string
  date: string
  author?: string
  draft: boolean
}

export interface CollectPostsResult {
  posts: Record<string, PostMetadata>
  errors: string[]
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

function normalizeDate(value: unknown): string | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }
  return undefined
}

export function collectPosts(
  files: PostFile[],
  { mode }: { mode: Mode },
): CollectPostsResult {
  const posts: Record<string, PostMetadata> = {}
  const errors: string[] = []

  for (const file of files) {
    if (!file.filename.endsWith(MDX_EXTENSION)) continue

    const slug = file.filename.slice(0, -MDX_EXTENSION.length)
    const issues: string[] = []

    if (!SLUG_PATTERN.test(slug)) {
      issues.push(`filename is not URL-safe (must match ${SLUG_PATTERN})`)
    }

    let data: Record<string, unknown>
    try {
      data = matter(file.contents).data as Record<string, unknown>
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      issues.push(`front-matter failed to parse: ${reason}`)
      errors.push(`${file.filename}: ${issues.join('; ')}`)
      continue
    }

    const title = isNonEmptyString(data.title) ? data.title : undefined
    if (title === undefined) issues.push('title must be a non-empty string')

    const description = isNonEmptyString(data.description)
      ? data.description
      : undefined
    if (description === undefined) {
      issues.push('description must be a non-empty string')
    }

    const date = normalizeDate(data.date)
    if (date === undefined) {
      issues.push('date must be an ISO YYYY-MM-DD date')
    }

    const author = isNonEmptyString(data.author) ? data.author : undefined
    if (data.author !== undefined && author === undefined) {
      issues.push('author must be a string')
    }

    if (issues.length > 0) {
      errors.push(`${file.filename}: ${issues.join('; ')}`)
      continue
    }

    const draft = data.draft === true
    if (draft && mode === 'production') continue

    posts[slug] = {
      slug,
      // title/description/date are guaranteed defined here: every branch
      // that could leave one undefined also pushed onto `issues` above.
      title: title as string,
      description: description as string,
      date: date as string,
      draft,
      ...(author !== undefined ? { author } : {}),
    }
  }

  return { posts, errors }
}
