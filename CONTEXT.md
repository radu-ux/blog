# Blog

A personal blog. Posts are authored as MDX files and indexed at build time so the client can discover and render them.

## Language

**Post**:
A single article, authored as one MDX file with front-matter.
_Avoid_: Article, entry, page

**Manifest**:
The build-time index of every Post's metadata, keyed by Slug and shipped to the client for discovering and loading Posts.
_Avoid_: Post list, registry

**Draft**:
A Post not yet published; it is left out of the production Manifest.
_Avoid_: Unpublished, hidden

**Slug**:
The unique, URL-safe identifier of a Post, taken from its filename and used to address it by URL.
_Avoid_: ID, key, permalink
