declare module 'virtual:posts' {
  import type { ComponentType } from 'react'
  import type { PostMetadata } from '../plugins/collect-posts.ts'

  export type { PostMetadata }

  export interface PostEntry {
    metadata: PostMetadata
    load: () => Promise<{ default: ComponentType }>
  }

  export const posts: Record<string, PostEntry>
}

declare module '*.mdx' {
  import type { ComponentType } from 'react'

  const MDXComponent: ComponentType
  export default MDXComponent
}
