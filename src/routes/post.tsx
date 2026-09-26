import type { ComponentType } from 'react'
import type { LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'
import { posts, type PostMetadata } from 'virtual:posts'

interface PostLoaderData {
  metadata: PostMetadata
  Content: ComponentType
}

export async function postLoader({
  params,
}: LoaderFunctionArgs): Promise<PostLoaderData> {
  const entry = params.slug ? posts[params.slug] : undefined

  if (!entry) {
    throw new Response('Not Found', { status: 404 })
  }

  const { default: Content } = await entry.load()

  return { metadata: entry.metadata, Content }
}

export function Post() {
  const { metadata, Content } = useLoaderData() as PostLoaderData

  return (
    <article className="flex flex-col gap-8">
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{metadata.title}</h1>
        <p className="text-muted-foreground text-sm">{metadata.date}</p>
        <p className="text-muted-foreground">{metadata.description}</p>
      </header>
      <div>
        <Content />
      </div>
    </article>
  )
}
