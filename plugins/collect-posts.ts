import matter from 'gray-matter'

export const MDX_EXTENSION = '.mdx'

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
    const { data } = matter(file.contents)

    const title = isNonEmptyString(data.title) ? data.title : undefined
    const description = isNonEmptyString(data.description)
      ? data.description
      : undefined
    const date = normalizeDate(data.date)

    if (
      title === undefined ||
      description === undefined ||
      date === undefined
    ) {
      const missingFields = [
        title === undefined && 'title',
        description === undefined && 'description',
        date === undefined && 'date',
      ].filter((field): field is string => Boolean(field))

      errors.push(
        `${file.filename}: missing required field(s) ${missingFields.join(', ')}`,
      )
      continue
    }

    const draft = data.draft === true
    if (draft && mode === 'production') continue

    const author = isNonEmptyString(data.author) ? data.author : undefined

    posts[slug] = {
      slug,
      title,
      description,
      date,
      draft,
      ...(author !== undefined ? { author } : {}),
    }
  }

  return { posts, errors }
}
